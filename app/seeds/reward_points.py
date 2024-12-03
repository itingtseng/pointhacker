from app.models import db, RewardPoint, Card, Category
import requests

def seed_reward_points():
    # Fetch data from the URL
    url = "https://raw.githubusercontent.com/andenacitelli/credit-card-bonuses-api/main/exports/data.json"
    response = requests.get(url)
    data = response.json()

    # Process and seed reward points
    for card_data in data.get("cards", []):
        # Find the card in the database
        card = Card.query.filter_by(name=card_data["name"]).first()
        if not card:
            continue  # Skip if the card does not exist

        # Create Reward Points
        for reward_data in card_data.get("reward_points", []):
            # Find or create the category
            category = Category.query.filter_by(name=reward_data["category_id"]).first()
            if not category:
                category = Category(name=reward_data["category_id"])
                db.session.add(category)
                db.session.commit()

            # Add reward point
            reward_point = RewardPoint(
                card_id=card.id,
                category_id=category.id,
                bonus_point=reward_data["bonus_point"],
                multiplier_type=reward_data["multiplier_type"],
            )
            db.session.add(reward_point)

    db.session.commit()

def undo_reward_points():
    db.session.execute("DELETE FROM reward_points")
    db.session.commit()
