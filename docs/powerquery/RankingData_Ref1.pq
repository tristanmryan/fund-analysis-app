let
    // 1. Load base data
    Source = #"RankingData [Main]",

    // 2. Load dynamic weights table
    ScoreWeights = Excel.CurrentWorkbook(){[Name="ScoreWeights"]}[Content],
    CleanedWeights = Table.SelectRows(ScoreWeights, each [Metric] <> null and [Weight] <> null),
    #"Changed Type - Weights" = Table.TransformColumnTypes(CleanedWeights, {{"Metric", type text}, {"Weight", type number}}),

    // 3. Merge asset class info
    #"Merged Queries" = Table.NestedJoin(Source, {"Ticker"}, FundListAssetClasses, {"Fund Ticker"}, "FundListAssetClasses", JoinKind.LeftOuter),
    #"Expanded FundListAssetClasses" = Table.ExpandTableColumn(#"Merged Queries", "FundListAssetClasses", {"Asset Class"}, {"Asset Class"}),

    // 4. Merge with StatsByAssetClass
    #"Merged Stats" = Table.NestedJoin(#"Expanded FundListAssetClasses", {"Asset Class"}, StatsByAssetClass, {"Asset Class"}, "StatsByAssetClass", JoinKind.LeftOuter),
    #"Expanded Stats" = Table.ExpandTableColumn(#"Merged Stats", "StatsByAssetClass", {
        "YTD Return_Avg", "YTD Return_StdDev",
        "1Y Return_Avg", "1Y Return_StdDev",
        "3Y Return_Avg", "3Y Return_StdDev",
        "5Y Return_Avg", "5Y Return_StdDev",
        "10Y Return_Avg", "10Y Return_StdDev",
        "3Y Sharpe Ratio_Avg", "3Y Sharpe Ratio_StdDev",
        "3Y Std Dev_Avg", "3Y Std Dev_StdDev",
        "5Y Std Dev_Avg", "5Y Std Dev_StdDev",
        "Up Capture Ratio (Morningstar Standard) - 3 Year_Avg", "Up Capture Ratio (Morningstar Standard) - 3 Year_StdDev",
        "Down Capture Ratio (Morningstar Standard) - 3 Year_Avg", "Down Capture Ratio (Morningstar Standard) - 3 Year_StdDev",
        "Alpha (Asset Class) - 5 Year_Avg", "Alpha (Asset Class) - 5 Year_StdDev",
        "Expense Ratio_Avg", "Expense Ratio_StdDev",
        "Longest Manager Tenure_Avg", "Longest Manager Tenure_StdDev"
    }),

    // 5. Define all metric triplets for Z-score + weight calculation
    ZCols = {
        {"YTD Return", "YTD Return_Avg", "YTD Return_StdDev", "Z_YTD Return"},
        {"1Y Return", "1Y Return_Avg", "1Y Return_StdDev", "Z_1Y Return"},
        {"3Y Return", "3Y Return_Avg", "3Y Return_StdDev", "Z_3Y Return"},
        {"5Y Return", "5Y Return_Avg", "5Y Return_StdDev", "Z_5Y Return"},
        {"10Y Return", "10Y Return_Avg", "10Y Return_StdDev", "Z_10Y Return"},
        {"3Y Sharpe Ratio", "3Y Sharpe Ratio_Avg", "3Y Sharpe Ratio_StdDev", "Z_3Y Sharpe Ratio"},
        {"3Y Std Dev", "3Y Std Dev_Avg", "3Y Std Dev_StdDev", "Z_3Y Std Dev"},
        {"5Y Std Dev", "5Y Std Dev_Avg", "5Y Std Dev_StdDev", "Z_5Y Std Dev"},
        {"Up Capture Ratio (Morningstar Standard) - 3 Year", "Up Capture Ratio (Morningstar Standard) - 3 Year_Avg", "Up Capture Ratio (Morningstar Standard) - 3 Year_StdDev", "Z_Up Capture - 3Y"},
        {"Down Capture Ratio (Morningstar Standard) - 3 Year", "Down Capture Ratio (Morningstar Standard) - 3 Year_Avg", "Down Capture Ratio (Morningstar Standard) - 3 Year_StdDev", "Z_Down Capture - 3Y"},
        {"Alpha (Asset Class) - 5 Year", "Alpha (Asset Class) - 5 Year_Avg", "Alpha (Asset Class) - 5 Year_StdDev", "Z_Alpha - 5Y"},
        {"Expense Ratio", "Expense Ratio_Avg", "Expense Ratio_StdDev", "Z_Expense Ratio"},
        {"Longest Manager Tenure", "Longest Manager Tenure_Avg", "Longest Manager Tenure_StdDev", "Z_Manager Tenure"}
    },

    // 6. Add Z-score columns
    AddZScores = List.Accumulate(
        ZCols,
        #"Expanded Stats",
        (state, col) =>
            Table.AddColumn(
                state,
                col{3},
                each
                    let
                        val = Record.Field(_, col{0}),
                        avg = Record.Field(_, col{1}),
                        std = Record.Field(_, col{2})
                    in
                        if std = null or std = 0 then null else (val - avg) / std,
                type number
            )
    ),

    // 7. Add RawScore using weights table
    AddRawScore = Table.AddColumn(AddZScores, "RawScore", each 
        List.Sum(
            List.Transform(ZCols, (col) =>
                let
                    metric = col{0},
                    weightRow = Table.SelectRows(#"Changed Type - Weights", each [Metric] = metric),
                    weight = if Table.IsEmpty(weightRow) then 0 else Record.Field(weightRow{0}, "Weight"),
                    zVal = Record.Field(_, col{3})
                in
                    if zVal = null then 0 else weight * zVal
            )
        ), type number),

    // 8. Clamp raw score to [0,100] for final Proprietary Score
    AddFinalScore = Table.AddColumn(AddRawScore, "ProprietaryScore", each 
        let
            scaled = 50 + 10 * [RawScore],
            clipped = if scaled < 0 then 0 else if scaled > 100 then 100 else scaled
        in clipped, type number)

in
    AddFinalScore