import pandas as pd
import matplotlib.pyplot as plt
import numpy as np



file_path = "full_dataset.xlsx"
xls = pd.ExcelFile(file_path)


df_shares = pd.read_excel(xls, sheet_name="shares of NIPA totals")


df_new = df_shares[
    (df_shares["Ranking"] == "Equivalized Disposable Personal Income") &
    (df_shares["Series"] == "Disposable Personal Income") &
    (df_shares["Quantile or Summary Metric"].isin([
        "0-10%", "10-20%", "20-30%", "30-40%", "40-50%",
        "50-60%", "60-70%", "70-80%", "80-90%", "90-100%",
        "Top 1%", "Top 5%", "Total ($ Billions)"
    ]))
].drop(columns=["NIPA Table21 LineNumber"]).copy()


total_values = df_new[df_new["Quantile or Summary Metric"] == "Total ($ Billions)"].set_index("Year")["Value"]


df_new_filtered = df_new[df_new["Quantile or Summary Metric"] != "Total ($ Billions)"].copy()


df_new_filtered["Value"] = df_new_filtered.apply(
    lambda row: row["Value"] * total_values[row["Year"]], axis=1
)


df_final = pd.concat([df_new_filtered, df_new[df_new["Quantile or Summary Metric"] == "Total ($ Billions)"]])


df_final = df_final.sort_values(by=["Year", "Quantile or Summary Metric"]).reset_index(drop=True)






df_pce = df_shares[
    (df_shares["Ranking"] == "Equivalized Disposable Personal Income") &
    (df_shares["Series"] == "Personal Consumption Expenditures") &
    (df_shares["Quantile or Summary Metric"].isin([
        "0-10%", "10-20%", "20-30%", "30-40%", "40-50%",
        "50-60%", "60-70%", "70-80%", "80-90%", "90-100%",
        "Top 1%", "Top 5%", "Total ($ Billions)"]))
].drop(columns=["NIPA Table21 LineNumber"]).copy()


total_pce_values = df_pce[df_pce["Quantile or Summary Metric"] == "Total ($ Billions)"].set_index("Year")["Value"]


df_pce_filtered = df_pce[df_pce["Quantile or Summary Metric"] != "Total ($ Billions)"].copy()


df_pce_filtered["Value"] = df_pce_filtered.apply(
    lambda row: row["Value"] * total_pce_values[row["Year"]], axis=1
)


df_pce_final = pd.concat([df_pce_filtered, df_pce[df_pce["Quantile or Summary Metric"] == "Total ($ Billions)"]])


df_pce_final = df_pce_final.sort_values(by=["Year", "Quantile or Summary Metric"]).reset_index(drop=True)






df_ps = df_shares[
    (df_shares["Ranking"] == "Equivalized Disposable Personal Income") &
    (df_shares["Series"] == "Personal Saving") &
    (df_shares["Quantile or Summary Metric"].isin([
        "0-10%", "10-20%", "20-30%", "30-40%", "40-50%",
        "50-60%", "60-70%", "70-80%", "80-90%", "90-100%",
        "Top 1%", "Top 5%", "Total ($ Billions)"]))
].drop(columns=["NIPA Table21 LineNumber"]).copy()


total_ps_values = df_ps[df_ps["Quantile or Summary Metric"] == "Total ($ Billions)"].set_index("Year")["Value"]


df_ps_filtered = df_ps[df_ps["Quantile or Summary Metric"] != "Total ($ Billions)"].copy()


df_ps_filtered["Value"] = df_ps_filtered.apply(
    lambda row: row["Value"] * total_ps_values[row["Year"]], axis=1
)


df_ps_final = pd.concat([df_ps_filtered, df_ps[df_ps["Quantile or Summary Metric"] == "Total ($ Billions)"]])


df_ps_final = df_ps_final.sort_values(by=["Year", "Quantile or Summary Metric"]).reset_index(drop=True)





df_final["Series"] = "Disposable Personal Income"
df_pce_final["Series"] = "Personal Consumption Expenditures"
df_ps_final["Series"] = "Personal Saving"


df_combined = pd.concat([df_final, df_pce_final, df_ps_final], ignore_index=True)


df_combined = df_combined[["Year", "Quantile or Summary Metric", "Series", "Value"]]


df_combined = df_combined.sort_values(by=["Year", "Quantile or Summary Metric", "Series"]).reset_index(drop=True)


quantile_mapping = {
    "0-10%": "0-20%",
    "10-20%": "0-20%",
    "20-30%": "20-40%",
    "30-40%": "20-40%",
    "40-50%": "40-60%",
    "50-60%": "40-60%",
    "60-70%": "60-80%",
    "70-80%": "60-80%",
    "80-90%": "80-100%",
    "90-100%": "80-100%",
}


df_combined_filtered = df_combined[df_combined["Quantile or Summary Metric"].isin(quantile_mapping.keys())].copy()


df_combined_filtered["Quantile or Summary Metric"] = df_combined_filtered["Quantile or Summary Metric"].map(quantile_mapping)


df_combined_aggregated = df_combined_filtered.groupby(["Year", "Quantile or Summary Metric", "Series"], as_index=False)["Value"].sum()


df_top = df_combined[df_combined["Quantile or Summary Metric"].isin(["Top 1%", "Top 5%", "Total ($ Billions)"])]


df_final_combined = pd.concat([df_combined_aggregated, df_top], ignore_index=True)


df_final_combined = df_final_combined.sort_values(by=["Year", "Quantile or Summary Metric", "Series"]).reset_index(drop=True)






while True:
    try:
        year = int(input("Please enter a year (2004-2022): "))
        if 2004 <= year <= 2022:
            break
        else:
            print("Invalid input! Please enter a year between 2004 and 2022.")
    except ValueError:
        print("Invalid input! Please enter an integer value.")


df_filtered = df_final_combined[
    (df_final_combined["Year"] == year) &
    (df_final_combined["Quantile or Summary Metric"].isin(["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"]))
]


if df_filtered.empty:
    print(f"No data available for the year {year}!")
else:

    categories = ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"]
    series_types = ["Disposable Personal Income", "Personal Consumption Expenditures", "Personal Saving"]


    bar_width = 0.3
    x_indexes = np.arange(len(categories))


    category_colors = {
        "Disposable Personal Income": "blue",
        "Personal Consumption Expenditures": "orange",
        "Personal Saving": "green"
    }


    plt.figure(figsize=(12, 6))

    for i, series in enumerate(series_types):
        values = [
            df_filtered[
                (df_filtered["Quantile or Summary Metric"] == category) &
                (df_filtered["Series"] == series)
            ]["Value"].sum()
            for category in categories
        ]
        plt.bar(x_indexes + i * bar_width, values, width=bar_width, label=series, color=category_colors[series])


    plt.xticks(x_indexes + bar_width, categories, rotation=45)
    plt.ylabel("Total Amount ($ Billions)")
    plt.xlabel("Percentile of Total Disposable Personal Income")
    plt.title(f"Income, Expenditures, and Savings by DPI Level ({year})")
    plt.legend()
    plt.grid(axis="y", linestyle="--", alpha=0.7)
    plt.tight_layout()
    plt.show()





file_path = "distributional-pce-2000-2022.xlsx"
xls = pd.ExcelFile(file_path)

df_table1data = pd.read_excel(xls, sheet_name="table1data")

df_selected = df_table1data.rename(columns={
    "year": "Year",
    "pce_title": "Expenditure",
    "Total": "Total ($ Billions)",
    "Decile1": "0-10%",
    "Decile2": "10-20%",
    "Decile3": "20-30%",
    "Decile4": "30-40%",
    "Decile5": "40-50%",
    "Decile6": "50-60%",
    "Decile7": "60-70%",
    "Decile8": "70-80%",
    "Decile9": "80-90%",
    "Decile10": "90-100%"
})


df_selected = df_selected[["Year", "Expenditure", "Total ($ Billions)",
                           "0-10%", "10-20%", "20-30%", "30-40%",
                           "40-50%", "50-60%", "60-70%", "70-80%",
                           "80-90%", "90-100%"]]


df_filtered = df_selected[(df_selected["Year"] >= 2004) & (df_selected["Year"] <= 2022)]


df_filtered = df_filtered.reset_index(drop=True)


df_filtered["0-20%"] = df_filtered["0-10%"] + df_filtered["10-20%"]
df_filtered["20-40%"] = df_filtered["20-30%"] + df_filtered["30-40%"]
df_filtered["40-60%"] = df_filtered["40-50%"] + df_filtered["50-60%"]
df_filtered["60-80%"] = df_filtered["60-70%"] + df_filtered["70-80%"]
df_filtered["80-100%"] = df_filtered["80-90%"] + df_filtered["90-100%"]


df_filtered["0-20%"] = df_filtered["0-20%"] * df_filtered["Total ($ Billions)"]
df_filtered["20-40%"] = df_filtered["20-40%"] * df_filtered["Total ($ Billions)"]
df_filtered["40-60%"] = df_filtered["40-60%"] * df_filtered["Total ($ Billions)"]
df_filtered["60-80%"] = df_filtered["60-80%"] * df_filtered["Total ($ Billions)"]
df_filtered["80-100%"] = df_filtered["80-100%"] * df_filtered["Total ($ Billions)"]


df_final = df_filtered[["Year", "Expenditure", "0-20%", "20-40%", "40-60%", "60-80%", "80-100%"]]
df_final_distribution = df_final.reset_index(drop=True)







df_combined_pivot = df_final_combined[df_final_combined['Series'] == 'Disposable Personal Income'] \
    .pivot(index=['Year', 'Quantile or Summary Metric'], columns='Series', values='Value') \
    .reset_index()


df_combined_pivot.rename(columns={'Disposable Personal Income': 'Disposable_Income'}, inplace=True)


df_distribution_melted = df_final_distribution.melt(id_vars=['Year', 'Expenditure'],
                                                    var_name='Quantile or Summary Metric', value_name='Value')

df_distribution_pivot = df_distribution_melted.pivot_table(index=['Year', 'Quantile or Summary Metric'],
                                                            columns='Expenditure', values='Value').reset_index()


df_distribution_pivot.columns = df_distribution_pivot.columns.str.strip()


df_distribution_pivot.rename(columns={
    'Personal Consumption Expenditures': 'Personal_Consumption',
    'Durable goods': 'Durable_Goods',
    'Nondurable goods': 'Nondurable_Goods',
    'Household consumption expenditures (for services)': 'Household_Consumption',
    'Final consumption expenditures of nonprofit institutions serving households (NPISHs) (132)': 'Nonprofit_Consumption'
}, inplace=True)


df_full_merged = pd.merge(df_combined_pivot, df_distribution_pivot, on=['Year', 'Quantile or Summary Metric'])


numeric_cols = ['Disposable_Income', 'Personal_Consumption', 'Durable_Goods',
                'Nondurable_Goods', 'Household_Consumption', 'Nonprofit_Consumption']

for col in numeric_cols:
    df_full_merged[col] = pd.to_numeric(df_full_merged[col], errors='coerce')


df_full_merged['Consumption to Disposable Income Ratio'] = (df_full_merged['Personal_Consumption'] / df_full_merged['Disposable_Income']) * 100
df_full_merged['Durable Goods Ratio'] = (df_full_merged['Durable_Goods'] / df_full_merged['Disposable_Income']) * 100
df_full_merged['Nondurable Goods Ratio'] = (df_full_merged['Nondurable_Goods'] / df_full_merged['Disposable_Income']) * 100
df_full_merged['Household Consumption Ratio'] = (df_full_merged['Household_Consumption'] / df_full_merged['Disposable_Income']) * 100
df_full_merged['Nonprofit Consumption Ratio'] = (df_full_merged['Nonprofit_Consumption'] / df_full_merged['Disposable_Income']) * 100


df_final_result = df_full_merged[['Year', 'Quantile or Summary Metric',
                                  'Consumption to Disposable Income Ratio',
                                  'Durable Goods Ratio', 'Nondurable Goods Ratio',
                                  'Household Consumption Ratio', 'Nonprofit Consumption Ratio']]







df_year = df_final_result[df_final_result["Year"] == year]


categories = df_year["Quantile or Summary Metric"]
durable = df_year["Durable Goods Ratio"]
nondurable = df_year["Nondurable Goods Ratio"]
household = df_year["Household Consumption Ratio"]
nonprofit = df_year["Nonprofit Consumption Ratio"]


colors = {
    "Household Consumption Ratio": "#1f77b4",
    "Nondurable Goods Ratio":  "#FFD700",
    "Durable Goods Ratio": "#ff7f0e",
    "Nonprofit Consumption Ratio": "#2ca02c"
}


fig, ax = plt.subplots(figsize=(10, 6))
bar_width = 0.6

p1 = ax.bar(categories, household, bar_width, label="Household Consumption Ratio", color=colors["Household Consumption Ratio"])
p2 = ax.bar(categories, nondurable, bar_width, bottom=household, label="Nondurable Goods Ratio", color=colors["Nondurable Goods Ratio"])
p3 = ax.bar(categories, durable, bar_width, bottom=household + nondurable, label="Durable Goods Ratio", color=colors["Durable Goods Ratio"])
p4 = ax.bar(categories, nonprofit, bar_width, bottom=household + nondurable + durable, label="Nonprofit Consumption Ratio", color=colors["Nonprofit Consumption Ratio"])


ax.set_ylabel("Consumption to Disposable Income Ratio")
ax.set_title(f"Consumption to Disposable Income Ratio by Quantile ({year})")
ax.legend()


plt.xticks(rotation=45)
plt.grid(axis='y', linestyle='--', alpha=0.7)

plt.subplots_adjust(bottom=0.25)


plt.figtext(0.2, 0.05,
    "**Durable Goods Ratio**\n"
    "• Motor vehicles and parts\n"
    "• Furnishings & durable household equipment\n"
    "• Recreational goods & vehicles\n"
    "• Other durable goods",
    wrap=True, horizontalalignment='left', fontsize=7, linespacing=1)

plt.figtext(0.45, 0.05,
    "**Nondurable Goods Ratio**\n"
    "• Food & beverages (off-premises)\n"
    "• Clothing and footwear\n"
    "• Gasoline & other energy goods\n"
    "• Other nondurable goods",
    wrap=True, horizontalalignment='left', fontsize=7, linespacing=1)

plt.figtext(0.65, 0.01,
    "**Household Consumption Ratio**\n"
    "• Housing and utilities\n"
    "• Health care\n"
    "• Transportation services\n"
    "• Recreation services\n"
    "• Food services & accommodations\n"
    "• Financial services & insurance\n"
    "• Other services",
    wrap=True, horizontalalignment='left', fontsize=7, linespacing=1)


plt.show()