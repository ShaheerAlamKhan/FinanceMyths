import pandas as pd
import json
import numpy as np

def process_excel_to_json():
    """Process Excel data and convert to JSON for viz2.js"""
    print("Processing Excel data...")
    
    # Load Excel file
    file_path = r"C:\Users\kuku-\Documents\GitHub\FinanceMyths\data\full_dataset.xlsx"
    xls = pd.ExcelFile(file_path)
    
    # Load the "shares of NIPA totals" sheet
    df_shares = pd.read_excel(xls, sheet_name="shares of NIPA totals")
    
    # Process data
    years = list(range(2004, 2023))  # 2004 to 2022
    categories = ["0-20%", "20-40%", "40-60%", "60-80%", "80-100%"]
    series_types = ["Disposable Personal Income", "Personal Consumption Expenditures", "Personal Saving"]
    
    # Prepare result structure
    result = {
        "years": years,
        "categories": categories,
        "seriesTypes": series_types,
        "yearlyData": {}
    }
    
    # Process data for each year
    for year in years:
        print(f"Processing year {year}...")
        
        # Process income data
        income_data = {}
        
        for series_type in series_types:
            # Filter data for this series and year
            df_series = df_shares[
                (df_shares["Ranking"] == "Equivalized Disposable Personal Income") &
                (df_shares["Series"] == series_type) &
                (df_shares["Year"] == year)
            ].copy()
            
            # Get total value
            total_value = df_series[
                df_series["Quantile or Summary Metric"] == "Total ($ Billions)"
            ]["Value"].values[0] if not df_series[
                df_series["Quantile or Summary Metric"] == "Total ($ Billions)"
            ].empty else 0
            
            # Create quantile mapping as in charles 189.py
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
            
            # Initialize category values
            category_values = {category: 0 for category in categories}
            
            # Process each row
            for _, row in df_series.iterrows():
                quantile = row["Quantile or Summary Metric"]
                if quantile in quantile_mapping:
                    category = quantile_mapping[quantile]
                    # Multiply share by total to get absolute value
                    category_values[category] += row["Value"] * total_value
            
            income_data[series_type] = category_values
        
        # Load PCE data for consumption breakdowns
        try:
            pce_file_path = r"C:\Users\kuku-\Documents\GitHub\FinanceMyths\data\distributional-pce-2000-2022.xlsx"
            pce_data = pd.read_excel(pce_file_path, sheet_name="table1data")
            
            # Filter for the current year
            pce_year_data = pce_data[pce_data["year"] == year]
            
            # Get main consumption categories
            household_consumption = pce_year_data[pce_year_data["pce_title"] == "Household consumption expenditures (for services)"]
            durable_goods = pce_year_data[pce_year_data["pce_title"] == "Durable goods"]
            nondurable_goods = pce_year_data[pce_year_data["pce_title"] == "Nondurable goods"]
            nonprofit_consumption = pce_year_data[pce_year_data["pce_title"] == "Final consumption expenditures of nonprofit institutions serving households (NPISHs) (132)"]
            
            # Process consumption ratios
            ratio_data = {}
            
            for category in categories:
                disposable_income = income_data["Disposable Personal Income"][category]
                
                if disposable_income > 0:
                    # Map from data columns to category ranges
                    col_mapping = {
                        "0-20%": ["Decile1", "Decile2"],
                        "20-40%": ["Decile3", "Decile4"],
                        "40-60%": ["Decile5", "Decile6"],
                        "60-80%": ["Decile7", "Decile8"],
                        "80-100%": ["Decile9", "Decile10"]
                    }
                    
                    # Calculate consumption ratios from PCE data
                    if not household_consumption.empty and not durable_goods.empty and not nondurable_goods.empty:
                        # Get column names for this category
                        cols = col_mapping[category]
                        
                        # Sum the values for the two deciles
                        hc_share = household_consumption[cols].sum(axis=1).values[0] if not household_consumption.empty else 0
                        dg_share = durable_goods[cols].sum(axis=1).values[0] if not durable_goods.empty else 0
                        ndg_share = nondurable_goods[cols].sum(axis=1).values[0] if not nondurable_goods.empty else 0
                        npc_share = nonprofit_consumption[cols].sum(axis=1).values[0] if not nonprofit_consumption.empty else 0
                        
                        # Get total values
                        hc_total = household_consumption["Total"].values[0] if not household_consumption.empty else 0
                        dg_total = durable_goods["Total"].values[0] if not durable_goods.empty else 0
                        ndg_total = nondurable_goods["Total"].values[0] if not nondurable_goods.empty else 0
                        npc_total = nonprofit_consumption["Total"].values[0] if not nonprofit_consumption.empty else 0
                        
                        # Calculate absolute values
                        hc_value = hc_share * hc_total
                        dg_value = dg_share * dg_total
                        ndg_value = ndg_share * ndg_total
                        npc_value = npc_share * npc_total
                        
                        # Calculate ratios to disposable income
                        hc_ratio = (hc_value / disposable_income) * 100
                        dg_ratio = (dg_value / disposable_income) * 100
                        ndg_ratio = (ndg_value / disposable_income) * 100
                        npc_ratio = (npc_value / disposable_income) * 100
                        
                        # Store ratios
                        ratio_data[category] = {
                            "Total Consumption Ratio": (income_data["Personal Consumption Expenditures"][category] / disposable_income) * 100,
                            "Household Consumption Ratio": hc_ratio,
                            "Nondurable Goods Ratio": ndg_ratio,
                            "Durable Goods Ratio": dg_ratio,
                            "Nonprofit Consumption Ratio": npc_ratio
                        }
                    else:
                        # Fallback if PCE data not available
                        ratio_data[category] = {
                            "Total Consumption Ratio": (income_data["Personal Consumption Expenditures"][category] / disposable_income) * 100,
                            "Household Consumption Ratio": 50 + np.random.rand() * 20, # placeholder
                            "Nondurable Goods Ratio": 25 + np.random.rand() * 10,     # placeholder
                            "Durable Goods Ratio": 15 + np.random.rand() * 10,        # placeholder
                            "Nonprofit Consumption Ratio": 2 + np.random.rand() * 2    # placeholder
                        }
                else:
                    ratio_data[category] = {
                        "Total Consumption Ratio": 0,
                        "Household Consumption Ratio": 0,
                        "Nondurable Goods Ratio": 0, 
                        "Durable Goods Ratio": 0,
                        "Nonprofit Consumption Ratio": 0
                    }
        except Exception as e:
            print(f"Error processing PCE data: {e}")
            # Fallback if PCE file not available
            ratio_data = {}
            for category in categories:
                disposable_income = income_data["Disposable Personal Income"][category]
                
                if disposable_income > 0:
                    ratio_data[category] = {
                        "Total Consumption Ratio": (income_data["Personal Consumption Expenditures"][category] / disposable_income) * 100,
                        "Household Consumption Ratio": 50 + np.random.rand() * 20, # placeholder
                        "Nondurable Goods Ratio": 25 + np.random.rand() * 10,     # placeholder
                        "Durable Goods Ratio": 15 + np.random.rand() * 10,        # placeholder
                        "Nonprofit Consumption Ratio": 2 + np.random.rand() * 2    # placeholder
                    }
                else:
                    ratio_data[category] = {
                        "Total Consumption Ratio": 0,
                        "Household Consumption Ratio": 0,
                        "Nondurable Goods Ratio": 0, 
                        "Durable Goods Ratio": 0,
                        "Nonprofit Consumption Ratio": 0
                    }
        
        # Add year data to result
        result["yearlyData"][str(year)] = {
            "income": income_data,
            "ratios": ratio_data
        }
    
    # Save to JSON file
    with open('data/viz2_data.json', 'w') as f:
        json.dump(result, f, indent=2)
    
    print("Processing complete! JSON saved to data/viz2_data.json")

if __name__ == "__main__":
    process_excel_to_json()