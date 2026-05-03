"""
SQLAlchemy модели для базы данных учета затрат на выращивание вешенок
"""
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import BigInteger, String, DateTime, Text, Enum, Boolean, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from typing import List

from database import Base


# Enum для SQLAlchemy
class TransactionTypePy(PyEnum):
    EXPENSE = "expense"
    INCOME = "income"


class PlanStatusPy(PyEnum):
    ACTIVE = "active"
    COMPLETED = "completed"


class CategoryTypePy(PyEnum):
    EXPENSE = "expense"
    INCOME = "income"


class User(Base):
    """Пользователи Telegram"""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    tg_user_id: Mapped[int] = mapped_column(BigInteger, unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )

    # Отношения
    categories: Mapped[List["Category"]] = relationship(
        "Category", 
        back_populates="user",
        cascade="all, delete-orphan"
    )
    plans: Mapped[List["Plan"]] = relationship(
        "Plan", 
        back_populates="user",
        cascade="all, delete-orphan"
    )


class Category(Base):
    """Категории расходов/доходов"""
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, 
        nullable=False, 
        index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[CategoryTypePy] = mapped_column(
        Enum(CategoryTypePy, name="category_type"),
        nullable=False,
        default=CategoryTypePy.EXPENSE
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )

    # Отношения
    user: Mapped["User"] = relationship("User", back_populates="categories")
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", 
        back_populates="category"
    )

    # Уникальность имени категории в рамках пользователя
    __table_args__ = (
        CheckConstraint("length(name) >= 1", name="check_category_name_length"),
    )


class Plan(Base):
    """Планы выращивания"""
    __tablename__ = "plans"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, 
        nullable=False, 
        index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False
    )
    end_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=True
    )
    revenue: Mapped[Decimal] = mapped_column(
        Decimal(10, 2), 
        nullable=False, 
        default=Decimal("0.00")
    )
    yield_kg: Mapped[Decimal] = mapped_column(
        Decimal(8, 2), 
        nullable=False, 
        default=Decimal("0.00")
    )
    status: Mapped[PlanStatusPy] = mapped_column(
        Enum(PlanStatusPy, name="plan_status"),
        nullable=False,
        default=PlanStatusPy.ACTIVE
    )
    notes: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )

    # Отношения
    user: Mapped["User"] = relationship("User", back_populates="plans")
    transactions: Mapped[List["Transaction"]] = relationship(
        "Transaction", 
        back_populates="plan",
        cascade="all, delete-orphan"
    )

    # Constraints
    __table_args__ = (
        CheckConstraint("length(name) >= 1", name="check_plan_name_length"),
        CheckConstraint("revenue >= 0", name="check_revenue_positive"),
        CheckConstraint("yield_kg >= 0", name="check_yield_positive"),
        CheckConstraint("start_date <= end_date", name="check_plan_dates"),
    )


class Transaction(Base):
    """Транзакции (расходы/доходы)"""
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    plan_id: Mapped[int] = mapped_column(
        BigInteger, 
        nullable=False, 
        index=True
    )
    category_id: Mapped[int] = mapped_column(
        BigInteger, 
        nullable=False, 
        index=True
    )
    amount: Mapped[Decimal] = mapped_column(
        Decimal(10, 2), 
        nullable=False
    )
    date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    comment: Mapped[str] = mapped_column(String(500), nullable=True)
    type: Mapped[TransactionTypePy] = mapped_column(
        Enum(TransactionTypePy, name="transaction_type"),
        nullable=False,
        default=TransactionTypePy.EXPENSE
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        server_default=func.now(),
        nullable=False
    )

    # Отношения
    plan: Mapped["Plan"] = relationship("Plan", back_populates="transactions")
    category: Mapped["Category"] = relationship("Category", back_populates="transactions")

    # Constraints
    __table_args__ = (
        CheckConstraint("amount >= 0", name="check_amount_positive"),
        CheckConstraint("length(comment) <= 500", name="check_comment_length"),
    )
