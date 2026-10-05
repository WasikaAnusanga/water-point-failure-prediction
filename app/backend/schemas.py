from enum import Enum
from typing import Dict, List, Any, Union
from pydantic import BaseModel, Field, field_validator


class BasinEnum(str, Enum):
    INTERNAL = "Internal"
    LAKE_NYASA = "Lake Nyasa"
    LAKE_RUKWA = "Lake Rukwa"
    LAKE_TANGANYIKA = "Lake Tanganyika"
    LAKE_VICTORIA = "Lake Victoria"
    PANGANI = "Pangani"
    RUFIJI = "Rufiji"
    RUVUMA_SOUTHERN_COAST = "Ruvuma / Southern Coast"
    WAMI_RUVU = "Wami / Ruvu"


class RegionEnum(str, Enum):
    ARUSHA = "Arusha"
    DAR_ES_SALAAM = "Dar es Salaam"
    DODOMA = "Dodoma"
    IRINGA = "Iringa"
    KAGERA = "Kagera"
    KIGOMA = "Kigoma"
    KILIMANJARO = "Kilimanjaro"
    LINDI = "Lindi"
    MANYARA = "Manyara"
    MARA = "Mara"
    MBEYA = "Mbeya"
    MOROGORO = "Morogoro"
    MTWARA = "Mtwara"
    MWANZA = "Mwanza"
    PWANI = "Pwani"
    RUKWA = "Rukwa"
    RUVUMA = "Ruvuma"
    SHINYANGA = "Shinyanga"
    SINGIDA = "Singida"
    TABORA = "Tabora"
    TANGA = "Tanga"


class PublicMeetingEnum(str, Enum):
    YES = "Yes"
    NO = "No"
    MISSING = "Missing"


class SchemeManagementEnum(str, Enum):
    COMPANY = "Company"
    MISSING = "Missing"
    OTHER = "Other"
    PARASTATAL = "Parastatal"
    PRIVATE_OPERATOR = "Private operator"
    SWC = "SWC"
    TRUST = "Trust"
    VWC = "VWC"
    WUA = "WUA"
    WUG = "WUG"
    WATER_BOARD = "Water Board"
    WATER_AUTHORITY = "Water authority"


class PermitEnum(str, Enum):
    YES = "Yes"
    NO = "No"
    MISSING = "Missing"


class ManagementGroupEnum(str, Enum):
    COMMERCIAL = "commercial"
    OTHER = "other"
    PARASTATAL = "parastatal"
    UNKNOWN = "unknown"
    USER_GROUP = "user-group"


class PaymentTypeEnum(str, Enum):
    ANNUALLY = "annually"
    MONTHLY = "monthly"
    NEVER_PAY = "never pay"
    ON_FAILURE = "on failure"
    OTHER = "other"
    PER_BUCKET = "per bucket"
    UNKNOWN = "unknown"


class ExtractionTypeClassEnum(str, Enum):
    GRAVITY = "gravity"
    HANDPUMP = "handpump"
    MOTORPUMP = "motorpump"
    OTHER = "other"
    ROPE_PUMP = "rope pump"
    SUBMERSIBLE = "submersible"
    WIND_POWERED = "wind-powered"


class QualityGroupEnum(str, Enum):
    COLORED = "colored"
    FLUORIDE = "fluoride"
    GOOD = "good"
    MILKY = "milky"
    SALTY = "salty"
    UNKNOWN = "unknown"


class QuantityEnum(str, Enum):
    DRY = "dry"
    ENOUGH = "enough"
    INSUFFICIENT = "insufficient"
    SEASONAL = "seasonal"
    UNKNOWN = "unknown"


class SourceTypeEnum(str, Enum):
    BOREHOLE = "borehole"
    DAM = "dam"
    OTHER = "other"
    RAINWATER_HARVESTING = "rainwater harvesting"
    RIVER_LAKE = "river/lake"
    SHALLOW_WELL = "shallow well"
    SPRING = "spring"


class WaterpointTypeGroupEnum(str, Enum):
    CATTLE_TROUGH = "cattle trough"
    COMMUNAL_STANDPIPE = "communal standpipe"
    DAM = "dam"
    HAND_PUMP = "hand pump"
    IMPROVED_SPRING = "improved spring"
    OTHER = "other"


class WaterPointInput(BaseModel):
    # 6 Numerical Features
    amount_tsh: float = Field(
        ...,
        ge=0.0,
        description="Total static head / amount of water available to waterpoint",
        examples=[0.0]
    )
    gps_height: float = Field(
        ...,
        description="Altitude of the well in meters",
        examples=[1390.0]
    )
    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
        description="GPS Longitude coordinate",
        examples=[34.938093]
    )
    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
        description="GPS Latitude coordinate",
        examples=[-9.856322]
    )
    population: float = Field(
        ...,
        ge=0.0,
        description="Population around the waterpoint",
        examples=[109.0]
    )
    waterpoint_age: float = Field(
        ...,
        ge=0.0,
        description="Age of the waterpoint in years (record_year - construction_year)",
        examples=[12.0]
    )

    # 12 Categorical Features
    basin: BasinEnum = Field(..., description="Geographic water basin", examples=["Lake Nyasa"])
    region: RegionEnum = Field(..., description="Administrative region in Tanzania", examples=["Iringa"])
    public_meeting: Union[PublicMeetingEnum, bool, None] = Field(..., description="Whether a public meeting was held", examples=["Yes"])
    scheme_management: SchemeManagementEnum = Field(..., description="Who operates the water scheme", examples=["VWC"])
    permit: Union[PermitEnum, bool, None] = Field(..., description="Whether the waterpoint has a permit", examples=["No"])
    management_group: ManagementGroupEnum = Field(..., description="Management categorization group", examples=["user-group"])
    payment_type: PaymentTypeEnum = Field(..., description="Cost / payment modality for water", examples=["never pay"])
    extraction_type_class: ExtractionTypeClassEnum = Field(..., description="Technical extraction mechanism class", examples=["gravity"])
    quality_group: QualityGroupEnum = Field(..., description="Quality assessment of the water", examples=["good"])
    quantity: QuantityEnum = Field(..., description="Quantity of available water", examples=["insufficient"])
    source_type: SourceTypeEnum = Field(..., description="Source of the waterpoint", examples=["spring"])
    waterpoint_type_group: WaterpointTypeGroupEnum = Field(..., description="Type of waterpoint structure", examples=["communal standpipe"])

    @field_validator("public_meeting", mode="before")
    @classmethod
    def normalize_public_meeting(cls, v: Any) -> str:
        if v is True:
            return "Yes"
        if v is False:
            return "No"
        if v is None:
            return "Missing"
        if isinstance(v, str):
            val_clean = v.strip()
            if val_clean in ["Yes", "No", "Missing"]:
                return val_clean
            if val_clean.lower() == "true":
                return "Yes"
            if val_clean.lower() == "false":
                return "No"
        return str(v)

    @field_validator("permit", mode="before")
    @classmethod
    def normalize_permit(cls, v: Any) -> str:
        if v is True:
            return "Yes"
        if v is False:
            return "No"
        if v is None:
            return "Missing"
        if isinstance(v, str):
            val_clean = v.strip()
            if val_clean in ["Yes", "No", "Missing"]:
                return val_clean
            if val_clean.lower() == "true":
                return "Yes"
            if val_clean.lower() == "false":
                return "No"
        return str(v)


class HealthResponse(BaseModel):
    status: str = "ok"


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    probabilities: Dict[str, float]


class MetadataResponse(BaseModel):
    target_classes: List[str]
    numerical_features: List[str]
    categorical_features: List[str]
    ordered_feature_names: List[str]
    categorical_values: Dict[str, List[str]]
