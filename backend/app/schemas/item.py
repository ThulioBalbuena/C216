from pydantic import BaseModel, ConfigDict, Field, field_validator


class ItemCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0, allow_inf_nan=False)
    description: str | None = Field(default=None, max_length=1000)


class ItemUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str | None = Field(default=None, min_length=1, max_length=100)
    price: float | None = Field(default=None, ge=0, allow_inf_nan=False)
    description: str | None = Field(default=None, max_length=1000)

    @field_validator("name", "price")
    @classmethod
    def reject_null(cls, value: str | float | None) -> str | float:
        if value is None:
            raise ValueError("O campo não pode ser nulo quando informado")
        return value


class ItemResponse(ItemCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(gt=0)
