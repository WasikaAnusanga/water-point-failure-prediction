import pandas as pd
import joblib


# 1. LOAD SAVED PREPROCESSING ARTIFACTS

# These files were created during the training/preprocessing stage.
# We reuse them for new user inputs so that the backend applies
# the SAME preprocessing used when training the final model.

frequency_maps = joblib.load("models/frequency_maps.pkl")

one_hot_encoder = joblib.load("models/one_hot_encoder.pkl")

standard_scaler = joblib.load("models/standard_scaler.pkl")



# 2. FEATURE ENGINEERING

def apply_feature_engineering(df):
    """
    Create the engineered features used by the trained model.

    Created features:
    - recorded_year
    - recorded_month
    - waterpoint_age
    - construction_year_missing
    """

    # Make a copy so that the original input DataFrame
    # is not modified directly.
    df = df.copy()


    # Convert date_recorded into a datetime value

    df["date_recorded"] = pd.to_datetime(
        df["date_recorded"],
        errors="coerce"
    )


    # Extract year from date_recorded

    df["recorded_year"] = df["date_recorded"].dt.year


    # Extract month from date_recorded

    df["recorded_month"] = df["date_recorded"].dt.month


    # Create a missing-value indicator
    # 1 = construction year is missing
    # 0 = construction year is available

    df["construction_year_missing"] = (
        df["construction_year"]
        .isna()
        .astype(int)
    )

    
    # Calculate water-point age
    
    # Age = recorded year - construction year

    df["waterpoint_age"] = (
        df["recorded_year"] -
        df["construction_year"]
    )

    return df


# 3. FREQUENCY ENCODING

def apply_frequency_encoding(df):
    """
    Apply frequency encoding to high-cardinality
    categorical variables.

    The frequency maps were learned from the training data.
    """

    # These variables have many categories.
    frequency_columns = [
        "funder",
        "installer",
        "subvillage",
        "ward",
        "scheme_name"
    ]

    # Process each high-cardinality column.
    for column in frequency_columns:

        # Example:
        # funder -> funder_freq
        # installer -> installer_freq
        new_column = column + "_freq"

        # Replace each category with its saved frequency.
        #
        # If a new category was not seen during training,
        # its value becomes 0.
        df[new_column] = (
            df[column]
            .map(frequency_maps[column])
            .fillna(0)
        )

    # Return the modified DataFrame.
    return df



# 4. NUMERICAL SCALING

def apply_scaling(df):
    """
    Apply the saved StandardScaler to numerical features.
    """

    # These are the 9 numerical features that were scaled
    # during model training.
    numerical_columns = [
        "amount_tsh",
        "gps_height",
        "longitude",
        "latitude",
        "num_private",
        "population",
        "recorded_year",
        "recorded_month",
        "waterpoint_age"
    ]

    # Use the scaler learned during training.
    df[numerical_columns] = standard_scaler.transform(
        df[numerical_columns]
    )

    return df



# 5. ONE-HOT ENCODING

def apply_one_hot_encoding(df):
    """
    Apply the saved OneHotEncoder to categorical variables.
    """

    categorical_columns = [
        "public_meeting",
        "permit",
        "quantity",
        "waterpoint_type_group",
        "payment_type",
        "source_type",
        "waterpoint_type",
        "extraction_type_class",
        "water_quality",
        "basin",
        "source",
        "scheme_management",
        "management",
        "extraction_type_group",
        "extraction_type",
        "region",
        "region_code",
        "district_code",
        "lga"
    ]

    # Select the categorical columns
    categorical_df = df[categorical_columns].copy()

    # Convert values to normal Python strings
    categorical_df = categorical_df.astype(str)

    # Convert to normal object dtype
    categorical_df = categorical_df.astype(object)

    # Replace missing values with "Missing"
    categorical_df = categorical_df.where(
        categorical_df.notna(),
        "Missing"
    )

    # Apply the saved encoder
    encoded_array = one_hot_encoder.transform(
        categorical_df
    )

    # Convert encoded result into a DataFrame
    encoded_df = pd.DataFrame(
        encoded_array,
        columns=one_hot_encoder.get_feature_names_out(),
        index=df.index
    )

    return encoded_df

# 6. COMPLETE PREPROCESSING PIPELINE

def preprocess_input(df):
    """
    Complete preprocessing pipeline for a new water-point record.

    Input:
        Raw water-point data

    Output:
        DataFrame containing exactly the features expected
        by the trained Random Forest model.
    """

    # Make a copy of the input.
    df = df.copy()


    # STEP 1: Feature engineering

    # Creates:
    # recorded_year
    # recorded_month
    # waterpoint_age
    # construction_year_missing
    df = apply_feature_engineering(df)

   
    # STEP 2: Frequency encoding

    # Creates:
    # funder_freq
    # installer_freq
    # subvillage_freq
    # ward_freq
    # scheme_name_freq
    df = apply_frequency_encoding(df)


    # STEP 3: Scaling

    # Scale the 9 numerical features.
    df = apply_scaling(df)


    # STEP 4: One-hot encoding
    
    # Creates the 319 categorical encoded features.
    encoded_df = apply_one_hot_encoding(df)

   
    # STEP 5: Select the non-one-hot features

    # These are the 15 features that are kept directly
    # after feature engineering/frequency encoding/scaling.
    numerical_columns = [
        "amount_tsh",
        "gps_height",
        "longitude",
        "latitude",
        "num_private",
        "population",
        "recorded_year",
        "recorded_month",
        "waterpoint_age",
        "construction_year_missing",
        "funder_freq",
        "installer_freq",
        "subvillage_freq",
        "ward_freq",
        "scheme_name_freq"
    ]

    numerical_df = df[numerical_columns]

    
    # STEP 6: Combine both feature groups
    
  
   
    
    final_df = pd.concat(
        [
            numerical_df,
            encoded_df
        ],
        axis=1
    )


    # STEP 7: Return the final model input
 
    return final_df