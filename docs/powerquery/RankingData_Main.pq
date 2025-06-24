let
    Source = Excel.Workbook(File.Contents("C:\Users\Tristan Ryan\Desktop\Fund List Project\New Data\RankingData.xlsx"), null, true),
    #"Sheet 1_Sheet" = Source{[Item="Sheet 1",Kind="Sheet"]}[Data],

    // Remove blank top rows and promote headers
    #"Removed Top Rows" = Table.Skip(#"Sheet 1_Sheet", 1),
    #"Promoted Headers" = Table.PromoteHeaders(#"Removed Top Rows", [PromoteAllScalars=true]),

    // Rename columns for consistency
    #"Renamed Columns" = Table.RenameColumns(#"Promoted Headers", {
        {"Symbol/CUSIP", "Ticker"},
        {"Product Name", "Fund Name"},
        {"Total Return - YTD (%)", "YTD Return"},
        {"Total Return - 1 Year (%)", "1Y Return"},
        {"Annualized Total Return - 3 Year (%)", "3Y Return"},
        {"Annualized Total Return - 5 Year (%)", "5Y Return"},
        {"Annualized Total Return - 10 Year (%)", "10Y Return"},
        {"Sharpe Ratio - 3 Year", "3Y Sharpe Ratio"},
        {"Standard Deviation - 3 Year", "3Y Std Dev"},
        {"Standard Deviation - 5 Year", "5Y Std Dev"},
        {"Net Exp Ratio (%)", "Expense Ratio"},
        {"Longest Manager Tenure (Years)", "Longest Manager Tenure"},
        {"Alpha (Asset Class) - 5 Year", "Alpha (Asset Class) - 5 Year"},
        {"Up Capture Ratio (Morningstar Standard) - 3 Year", "Up Capture Ratio (Morningstar Standard) - 3 Year"},
        {"Down Capture Ratio (Morningstar Standard) - 3 Year", "Down Capture Ratio (Morningstar Standard) - 3 Year"}
    }),


    // Proper case + smart casing replacements for key terms
    #"Proper Case Fund Name" = Table.TransformColumns(#"Renamed Columns", {{"Fund Name", Text.Proper, type text}}),
    #"Formatted Fund Name" = Table.TransformColumns(#"Proper Case Fund Name", {
        {"Fund Name", each 
            Text.Replace(Text.Replace(Text.Replace(Text.Replace(Text.Replace(
            Text.Replace(Text.Replace(Text.Replace(Text.Replace(Text.Replace(
            Text.Replace(Text.Replace(Text.Replace(Text.Replace(Text.Replace(Text.Replace(
            Text.Replace(Text.Replace(Text.Replace(Text.Replace(Text.Replace(
            Text.Replace(_, "Etf", "ETF"), "Fd", "FD"), "Fund", "FUND"), " Tr ", " TR "),
            "S&p", "S&P"), "Bd", "BD"), " Inc ", " INC "), "Bny", "BNY"), "Instl", "INSTL"),
            "U.s.", "U.S."), "Nasdaq", "NASDAQ"), "Dws", "DWS"), "Msci", "MSCI"), "Schwab", "Schwab"),
            "Ishares", "iShares"), "Spdr", "SPDR"), "Vanguard", "Vanguard"), "Jpmorgan", "JPMorgan"),
            "Mfs", "MFS"), "Nyli", "NYLI"), "Pimco", "PIMCO"), "Us", "US"), type text}
    }),

    // Change types for all numeric columns
    #"Changed Types" = Table.TransformColumnTypes(#"Formatted Fund Name", {
        {"YTD Return", type number},
        {"1Y Return", type number},
        {"3Y Return", type number},
        {"5Y Return", type number},
        {"10Y Return", type number},
        {"3Y Sharpe Ratio", type number},
        {"3Y Std Dev", type number},
        {"5Y Std Dev", type number},
        {"Expense Ratio", type number},
        {"Longest Manager Tenure", type number},
        {"Alpha (Asset Class) - 5 Year", type number},
        {"Up Capture Ratio (Morningstar Standard) - 3 Year", type number},
        {"Down Capture Ratio (Morningstar Standard) - 3 Year", type number}
    }),

    // Convert percentage columns to decimal format
    #"Corrected Percentages" = Table.TransformColumns(#"Changed Types", {
        {"YTD Return", each _ / 100, type number},
        {"1Y Return", each _ / 100, type number},
        {"3Y Return", each _ / 100, type number},
        {"5Y Return", each _ / 100, type number},
        {"10Y Return", each _ / 100, type number},
        {"Expense Ratio", each _ / 100, type number}
    }),

    // Reorder for ease of review (optional)
    #"Reordered Columns" = Table.ReorderColumns(#"Corrected Percentages", {
        "Ticker", "Fund Name", "YTD Return", "1Y Return", "3Y Return", "5Y Return", "10Y Return",
        "3Y Sharpe Ratio", "3Y Std Dev", "5Y Std Dev", "Expense Ratio", "Longest Manager Tenure",
        "Alpha (Asset Class) - 5 Year", "Up Capture Ratio (Morningstar Standard) - 3 Year", "Down Capture Ratio (Morningstar Standard) - 3 Year"
    })
in
    #"Reordered Columns"