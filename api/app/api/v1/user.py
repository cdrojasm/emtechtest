from app.db.base import get_db
from app.schemas.user import UserSchema, CreateUserSchema, ResponseUserSchema
from app.db.models import User
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

user_router = APIRouter(prefix="/user", tags=["user"])


@user_router.post("/", response_model=ResponseUserSchema)
async def create_user_endpoint(
    user_creation_data: CreateUserSchema, db: Session = Depends(get_db)
) -> ResponseUserSchema:
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            User.id == user_creation_data.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=400, detail="User with this ID already exists"
            )
        new_user = User(**user_creation_data.model_dump())
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return ResponseUserSchema(
            data=UserSchema(
                id=new_user.id,
                name=new_user.name,
                email=new_user.email,
                phone=new_user.phone,
                created_at=new_user.created_at,
                last_connection=None,
                conversations=[]  # Assuming no conversations are associated at creation
            ), msg="User created successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@user_router.get("/{user_id}", response_model=ResponseUserSchema)
async def get_user_endpoint(
    user_id: str, db: Session = Depends(get_db)
) -> ResponseUserSchema:
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return ResponseUserSchema(
            data=UserSchema(**user.__dict__), msg="User retrieved successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
