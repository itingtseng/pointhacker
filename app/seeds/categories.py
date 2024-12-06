from app.models import db, Category, environment, SCHEMA
from sqlalchemy.sql import text

def seed_categories():
    """
    Seeds initial categories and subcategories into the database.
    """
    # Define categories and subcategories
    categories_data = [
        {
            "name": "dining",
            "subcategories": [
                {"name": "restaurants"},
                {"name": "fast food"}
            ]
        },
        {
            "name": "travel",
            "subcategories": [
                {"name": "airlines"},
                {"name": "hotels"},
                {"name": "car rentals"}
            ]
        },
        {
            "name": "groceries",
            "subcategories": [
                {"name": "supermarkets"},
                {"name": "specialty stores"}
            ]
        },
        {
            "name": "gas",
            "subcategories": [
                {"name": "gas stations"},
                {"name": "electric charging stations"}
            ]
        },
        {
            "name": "entertainment",
            "subcategories": [
                {"name": "movies"},
                {"name": "concerts"},
                {"name": "theaters"}
            ]
        },
        {
            "name": "online shopping",
            "subcategories": [
                {"name": "e-commerce"},
                {"name": "subscriptions"}
            ]
        },
    ]

    # Create categories and their subcategories
    for category_data in categories_data:
        # Check for existing category
        existing_category = Category.query.filter_by(name=category_data["name"]).first()
        if existing_category:
            category = existing_category
        else:
            category = Category(name=category_data["name"])
            db.session.add(category)
            db.session.commit()  # Commit to get the category ID

        # Add subcategories
        for subcategory_data in category_data.get("subcategories", []):
            existing_subcategory = Category.query.filter_by(
                name=subcategory_data["name"],
                parent_category_id=category.id
            ).first()
            if not existing_subcategory:
                subcategory = Category(name=subcategory_data["name"], parent_category_id=category.id)
                db.session.add(subcategory)

    db.session.commit()


def undo_categories():
    """
    Removes all categories from the database and resets primary keys.
    """
    if environment == "production":
        db.session.execute(f"TRUNCATE TABLE {SCHEMA}.categories RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM categories"))
    db.session.commit()
