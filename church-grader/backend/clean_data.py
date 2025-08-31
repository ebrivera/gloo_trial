import pandas as pd
import re

def clean_church_data(input_file, output_file):
    """
    Clean the church data CSV file to ensure proper format for the evaluation system.
    """
    # Read the CSV file
    df = pd.read_csv(input_file)
    
    print(f"Original data shape: {df.shape}")
    print(f"Original columns: {df.columns.tolist()}")
    
    # Clean column names
    df.columns = [col.strip() for col in df.columns]
    
    # Remove rows where both chatbot and website are empty
    df = df.dropna(subset=['Chatbot', 'Website'], how='all')
    
    # Remove rows where chatbot is empty (since that's the important part)
    df = df.dropna(subset=['Chatbot'])
    
    # Clean chatbot column
    df['Chatbot'] = df['Chatbot'].astype(str).str.strip()
    
    # Remove rows with empty chatbot after cleaning
    df = df[df['Chatbot'] != '']
    df = df[df['Chatbot'] != 'nan']
    
    # Clean website column
    df['Website'] = df['Website'].astype(str).str.strip()
    
    # Handle missing websites - we'll keep these but mark them
    df['Website'] = df['Website'].replace(['', 'nan'], 'NO_WEBSITE')
    
    # Remove duplicate chatbot entries (keep first occurrence)
    df = df.drop_duplicates(subset=['Chatbot'], keep='first')
    
    # Clean chatbot handles - ensure they start with @
    df['Chatbot'] = df['Chatbot'].apply(lambda x: f"@{x.lstrip('@')}" if x else x)
    
    # Clean website URLs - ensure they have protocol
    def clean_website(url):
        if url == 'NO_WEBSITE':
            return url
        if not url.startswith(('http://', 'https://')):
            return f"https://{url}"
        return url
    
    df['Website'] = df['Website'].apply(clean_website)
    
    # Final filtering - remove any remaining problematic rows
    df = df[df['Chatbot'].str.len() > 1]  # At least @ + 1 character
    
    print(f"Cleaned data shape: {df.shape}")
    print(f"Sample of cleaned data:")
    print(df.head(10))
    
    # Save cleaned data
    df.to_csv(output_file, index=False)
    print(f"\nCleaned data saved to: {output_file}")
    
    # Summary statistics
    print(f"\nSummary:")
    print(f"- Total churches: {len(df)}")
    print(f"- Churches with websites: {len(df[df['Website'] != 'NO_WEBSITE'])}")
    print(f"- Churches without websites: {len(df[df['Website'] == 'NO_WEBSITE'])}")
    
    return df

if __name__ == "__main__":
    input_file = "data/Church chatbots and websites - Sheet1.csv"
    output_file = "data/churches_cleaned.csv"
    
    cleaned_df = clean_church_data(input_file, output_file)
