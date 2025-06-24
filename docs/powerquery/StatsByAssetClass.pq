let
    // Bring in base data
    Source = #"RankingData [Main]",

    // Merge Asset Class
    #"Merged Queries" = Table.NestedJoin(
        Source, 
        {"Ticker"}, 
        FundListAssetClasses, 
        {"Fund Ticker"}, 
        "FundListAssetClasses", 
        JoinKind.LeftOuter
    ),
    #"Expanded FundListAssetClasses" = Table.ExpandTableColumn(
        #"Merged Queries", 
        "FundListAssetClasses", 
        {"Asset Class"}, 
        {"Asset Class"}
    ),

    // Reorder if needed
    #"Reordered Columns" = Table.ReorderColumns(
        #"Expanded FundListAssetClasses",
        {
            "Ticker", 
            "Fund Name", 
            "Asset Class", 
            "YTD Return", 
            "1Y Return", 
            "3Y Return", 
            "5Y Return", 
            "10Y Return",
            "3Y Sharpe Ratio", 
            "3Y Std Dev", 
            "Expense Ratio", 
            "Longest Manager Tenure",
            "Alpha (Asset Class) - 5 Year",
            "Up Capture Ratio (Morningstar Standard) - 3 Year",
            "Down Capture Ratio (Morningstar Standard) - 3 Year"
        }
    ),

    // Group by Asset Class and calculate averages and std devs
    #"Grouped By AssetClass" = Table.Group(
        #"Reordered Columns", 
        {"Asset Class"},
        {
            // Core returns
            {"YTD Return_Avg", each List.Average([#"YTD Return"]), type number},
            {"YTD Return_StdDev", each List.StandardDeviation([#"YTD Return"]), type number},
            {"1Y Return_Avg", each List.Average([#"1Y Return"]), type number},
            {"1Y Return_StdDev", each List.StandardDeviation([#"1Y Return"]), type number},
            {"3Y Return_Avg", each List.Average([#"3Y Return"]), type number},
            {"3Y Return_StdDev", each List.StandardDeviation([#"3Y Return"]), type number},
            {"5Y Return_Avg", each List.Average([#"5Y Return"]), type number},
            {"5Y Return_StdDev", each List.StandardDeviation([#"5Y Return"]), type number},
            {"10Y Return_Avg", each List.Average([#"10Y Return"]), type number},
            {"10Y Return_StdDev", each List.StandardDeviation([#"10Y Return"]), type number},

            // Risk & efficiency
            {"3Y Sharpe Ratio_Avg", each List.Average([#"3Y Sharpe Ratio"]), type number},
            {"3Y Sharpe Ratio_StdDev", each List.StandardDeviation([#"3Y Sharpe Ratio"]), type number},
            {"3Y Std Dev_Avg", each List.Average([#"3Y Std Dev"]), type number},
            {"3Y Std Dev_StdDev", each List.StandardDeviation([#"3Y Std Dev"]), type number},

            // Expenses & management
            {"Expense Ratio_Avg", each List.Average([#"Expense Ratio"]), type number},
            {"Expense Ratio_StdDev", each List.StandardDeviation([#"Expense Ratio"]), type number},
            {"Longest Manager Tenure_Avg", each List.Average([#"Longest Manager Tenure"]), type number},
            {"Longest Manager Tenure_StdDev", each List.StandardDeviation([#"Longest Manager Tenure"]), type number},

            // Alpha
            {"Alpha (Asset Class) - 5 Year_Avg", each List.Average([#"Alpha (Asset Class) - 5 Year"]), type number},
            {"Alpha (Asset Class) - 5 Year_StdDev", each List.StandardDeviation([#"Alpha (Asset Class) - 5 Year"]), type number},

            // Capture ratios
            {"Up Capture Ratio (Morningstar Standard) - 3 Year_Avg", each List.Average([#"Up Capture Ratio (Morningstar Standard) - 3 Year"]), type number},
            {"Up Capture Ratio (Morningstar Standard) - 3 Year_StdDev", each List.StandardDeviation([#"Up Capture Ratio (Morningstar Standard) - 3 Year"]), type number},
            {"Down Capture Ratio (Morningstar Standard) - 3 Year_Avg", each List.Average([#"Down Capture Ratio (Morningstar Standard) - 3 Year"]), type number},
            {"Down Capture Ratio (Morningstar Standard) - 3 Year_StdDev", each List.StandardDeviation([#"Down Capture Ratio (Morningstar Standard) - 3 Year"]), type number}
        }
    )
in
    #"Grouped By AssetClass"