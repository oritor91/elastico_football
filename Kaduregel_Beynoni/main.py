import json
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import random
from difflib import get_close_matches

with open('soccer_team.json', 'r', encoding='utf-8') as read_file:
    data = json.load(read_file)

# Access players safely
if 'players' in data:
    players = data['players']
else:
    players = {}


# ################################ initial settings and basic functions ################################ #

# Create initial JSON file (not necessary anymore)
def initial_data_json_creation():
    initial_data = {
        "games": [],
        "players": {}
    }

    # Save the initial structure to a file
    with open('soccer_team.json', 'w', encoding='utf-8') as initial_write_file:
        json.dump(initial_data, initial_write_file, ensure_ascii=False, indent=4)

    # Load the existing data
    with open('soccer_team.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Example of updating the players with new attributes
    for player_name, player_data in data['players'].items():
        if 'rating' not in player_data:
            player_data['rating'] = 3.0  # Default rating
        if 'position' not in player_data:
            player_data['position'] = 'both'  # Default position
        if 'past_teams' not in player_data:
            player_data['past_teams'] = []  # Default past teams

    # Save the updated data back to the JSON file
    with open('soccer_team.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


# Fill initially all the past games into the JSON (not necessary anymore)
def auto_fill_data():
    # Load the existing data from the JSON file
    with open('soccer_team.json', 'r', encoding='utf-8') as read_file:
        existing_data = json.load(read_file)

    # Initialize the starting date and the months back
    start_date = datetime.strptime('29.02.24', '%d.%m.%y')
    months_back = 1

    # Calculate the end date
    end_date = start_date - relativedelta(months=months_back)
    current_date = start_date

    # Loop through dates from start_date to end_date
    while current_date >= end_date:
        if current_date.weekday() == 1:  # Tuesday
            day_of_week = 'Tuesday'
        elif current_date.weekday() == 5:  # Saturday
            day_of_week = 'Saturday'
        else:
            current_date -= timedelta(days=1)
            continue

        # Print the current date and day of the week
        print(f"Enter the player names for the game on {current_date.strftime('%d.%m.%Y')}:")

        # Get player names from the user
        players = []
        while True:
            player = input()
            if player.strip().lower() == 'done':
                break
            players.append(player.strip())

        # Add the game to the data
        game = {
            "date": current_date.strftime('%Y-%m-%d'),
            "day_of_week": day_of_week,
            "players": players
        }
        existing_data["games"].append(game)

        # Update player statistics
        for player in players:
            if player not in existing_data["players"]:
                existing_data["players"][player] = {"tuesday_games": 0, "saturday_games": 0, "total_games": 0}
            if day_of_week == 'Tuesday':
                existing_data["players"][player]["tuesday_games"] += 1
            elif day_of_week == 'Saturday':
                existing_data["players"][player]["saturday_games"] += 1
            existing_data["players"][player]["total_games"] += 1

        # Move to the previous day
        current_date -= timedelta(days=1)

    # Save the updated data back to the JSON file
    with open('soccer_team.json', 'w', encoding='utf-8') as auto_fill_write_file:
        json.dump(existing_data, auto_fill_write_file, ensure_ascii=False, indent=4)


# Load the existing data from the JSON file
def load_data():
    # Open the file using 'utf-8' encoding to avoid Unicode errors
    with open('soccer_team.json', 'r', encoding='utf-8') as read_file:
        data = json.load(read_file)
    return data


# Save the updated data back to the JSON file
def save_data(data):
    # Save the updated data back to the file, ensuring 'utf-8' encoding
    with open('soccer_team.json', 'w', encoding='utf-8') as write_file:
        json.dump(data, write_file, ensure_ascii=False, indent=4)


# Ensure all players have the necessary attributes
def update_player_info(players):
    for player_name, player_data in players.items():
        if 'rating' not in player_data:
            player_data['rating'] = 3.0  # Default rating
        if 'position' not in player_data:
            player_data['position'] = 'both'  # Default position
        if 'past_teams' not in player_data:
            player_data['past_teams'] = []  # Default past teams


def sync_player_stats(data):
    # Reset all player stats
    for player in data['players']:
        data['players'][player]['tuesday_games'] = 0
        data['players'][player]['thursday_games'] = 0  # נוסיף יום חמישי
        data['players'][player]['saturday_games'] = 0
        data['players'][player]['total_games'] = 0

    # Recalculate the stats based on the recorded games
    for game in data['games']:
        day_of_week = game['day_of_week']
        for player_name in game['players']:
            if player_name in data['players']:
                if day_of_week == 'Tuesday':
                    data['players'][player_name]['tuesday_games'] += 1
                elif day_of_week == 'Thursday':
                    data['players'][player_name]['thursday_games'] += 1
                elif day_of_week == 'Saturday':
                    data['players'][player_name]['saturday_games'] += 1
                data['players'][player_name]['total_games'] += 1

    # Sort players by total_games in descending order
    sorted_players = dict(sorted(data['players'].items(), key=lambda item: item[1]['total_games'], reverse=True))
    data['players'] = sorted_players

    # Save the updated data back to the JSON file
    save_data(data)
    print("Player stats synchronized and sorted successfully.")



def update_player_ratings(data):
    # Ask for the starting player name
    start_from = input("Enter the name of the player to start from (leave empty to start from the beginning): ").strip()

    # Determine where to start
    start_index = 0
    if start_from:
        player_names = list(data['players'].keys())
        if start_from in player_names:
            start_index = player_names.index(start_from)
        else:
            print(f"Player '{start_from}' not found. Starting from the beginning.")
            start_index = 0

    # Iterate over players starting from the specified index
    for player_name in list(data['players'].keys())[start_index:]:
        player_data = data['players'][player_name]
        print(f"Updating information for player: {player_name}")

        # Ask for the rating
        while True:
            try:
                rating = float(input("Enter the player's rating (1 to 5, with increments of 0.5): ").strip())
                if 1.0 <= rating <= 5.0 and rating % 0.5 == 0:
                    break
                else:
                    print("Please enter a valid rating between 1 and 5, in increments of 0.5.")
            except ValueError:
                print("Invalid input. Please enter a number.")

        # Ask for the defensive position including goalkeeper
        while True:
            defense_input = input(
                "Enter the player's defensive role (1 for Defensive, 2 for Offensive, 3 for Both, 4 for Goalkeeper): ").strip()
            if defense_input == '1':
                defense_role = "Defensive"
                break
            elif defense_input == '2':
                defense_role = "Offensive"
                break
            elif defense_input == '3':
                defense_role = "Both"
                break
            elif defense_input == '4':
                defense_role = "Goalkeeper"
                break
            else:
                print("Please enter 1, 2, 3, or 4.")

        # Update the player data
        player_data['rating'] = rating
        player_data['position'] = defense_role

        # Save the updated data back to the JSON file after each update
        save_data(data)
        print(f"Updated and saved data for player: {player_name}\n")


# ################################ specific game helper ################################ #

# A function for adding one specific game into the JSON
from datetime import datetime
import json

import json
from datetime import datetime

import json
from datetime import datetime

import json
from datetime import datetime


def add_game():
    # Load the existing data from the JSON file
    with open('soccer_team.json', 'r', encoding='utf-8') as read_file:
        data = json.load(read_file)

    # Prompt user for game details
    date = input("Enter the date of the game (DD.MM.YY): ")
    date = datetime.strptime(date, '%d.%m.%y').strftime('%Y-%m-%d')

    day_of_week_input = input(
        "Enter the day of the week (T for Tuesday, H for Thursday, S for Saturday): ").strip().upper()

    if day_of_week_input == 'T':
        day_of_week = 'Tuesday'
        day_key = 'tuesday_games'
    elif day_of_week_input == 'H':
        day_of_week = 'Thursday'
        day_key = 'thursday_games'
    elif day_of_week_input == 'S':
        day_of_week = 'Saturday'
        day_key = 'saturday_games'
    else:
        print("Invalid input for day of the week. Please enter 'T' for Tuesday, 'H' for Thursday, or 'S' for Saturday.")
        return

    print("Enter the player names, each on a new line. Type 'done' when finished:")
    players = []
    while True:
        player = input()
        if player.strip().lower() == 'done':
            break
        players.append(player.strip())

    # Add the game to the data
    game = {
        "date": date,
        "day_of_week": day_of_week,
        "players": players
    }
    data["games"].insert(0, game)  # Insert at the beginning to keep newest first

    # Ensure every player has 'thursday_games' key
    for player in data["players"]:
        if "thursday_games" not in data["players"][player]:
            data["players"][player]["thursday_games"] = 0

    # Update player statistics
    for player in players:
        if player not in data["players"]:
            data["players"][player] = {
                "tuesday_games": 0,
                "thursday_games": 0,  # Ensure new players get Thursday initialized
                "saturday_games": 0,
                "total_games": 0
            }

        # Increase game count for the specific day
        data["players"][player][day_key] += 1
        data["players"][player]["total_games"] += 1

    # **🔹 Reorder player data to maintain a fixed order**
    for player in data["players"]:
        ordered_data = {
            "tuesday_games": data["players"][player].get("tuesday_games", 0),
            "thursday_games": data["players"][player].get("thursday_games", 0),
            "saturday_games": data["players"][player].get("saturday_games", 0),
            "total_games": data["players"][player].get("total_games", 0),
        }
        # Merge with the rest of the player's data while keeping order
        for key, value in data["players"][player].items():
            if key not in ordered_data:
                ordered_data[key] = value
        data["players"][player] = ordered_data

    # Save the updated data back to the JSON file
    with open('soccer_team.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

    print("Game has been added and data has been saved.")


# A function just for sort players from a list
def sort_players_only():
    # Load the existing data from the JSON file
    with open('soccer_team.json', 'r', encoding='utf-8') as read_file:
        data = json.load(read_file)

    # Ask for sorting preference
    day_of_week_input = input(
        "Enter the day of the week (T for Tuesday, H for Thursday, S for Saturday, A for All Games): ").strip().upper()
    if day_of_week_input == 'T':
        day_key = 'tuesday_games'
        day_of_week = 'Tuesday'
    elif day_of_week_input == 'H':
        day_key = 'thursday_games'
        day_of_week = 'Thursday'
    elif day_of_week_input == 'S':
        day_key = 'saturday_games'
        day_of_week = 'Saturday'
    elif day_of_week_input == 'A':
        day_key = 'total_games'
        day_of_week = 'All Games'
    else:
        print("Invalid input. Please enter 'T' for Tuesday, 'H' for Thursday, 'S' for Saturday, or 'A' for All Games.")
        return

    print("Enter the player names, each on a new line. Type 'done' when finished:")
    players = []
    while True:
        player = input()
        if player.strip().lower() == 'done':
            break
        players.append(player.strip())

    # Step 1: Sort the entire list based on prioritization rules
    sorted_players_by_priority = sorted(players, key=lambda p: (
    -data["players"][p].get(day_key, 0), -data["players"][p]["total_games"]))

    # Step 2: Take the first 13 players from the sorted list
    first_13_players = sorted_players_by_priority[:13]

    # Step 3: For the next 2 spots, take the first two players based on the original input order
    remaining_players = sorted_players_by_priority[13:]
    next_two_spots = []
    for player in players:
        if player in remaining_players:
            next_two_spots.append(player)
            remaining_players.remove(player)
            if len(next_two_spots) == 2:
                break

    # Step 4: Sort remaining players (who are on hold) based on prioritization rules
    on_hold = sorted(remaining_players,
                     key=lambda p: (-data["players"][p].get(day_key, 0), -data["players"][p]["total_games"]))

    # Combine the lists for final output
    final_list = first_13_players + next_two_spots + on_hold

    # Display the sorted player list with the number of games
    print(f"Final sorted player list for the game ({day_of_week}):")
    for i, player in enumerate(final_list, start=1):
        games_on_day = data["players"][player].get(day_key, 0)
        total_games = data["players"][player]["total_games"]
        print(f"{i}. {player} - {day_key}: {games_on_day}, Total games: {total_games}")

    # Print a clean list of names for easy copying
    print("\nCopy-paste friendly list of player names:")
    for player in final_list:
        print(player)


# Players comparison
def compare_players(data, player1, player2, day_of_week=None):
    """
    Function to compare two players and get the list of dates where one played and the other did not.
    :param data: The JSON data
    :param player1: The first player's name
    :param player2: The second player's name
    :param day_of_week: Optional, specify the day (Tuesday/Saturday)
    :return: Dates where player1 played and player2 did not, and vice versa
    """
    player1_dates = set(get_player_dates(data, player1, day_of_week))
    player2_dates = set(get_player_dates(data, player2, day_of_week))

    # Dates where player1 played and player2 did not
    player1_only_dates = player1_dates - player2_dates
    # Dates where player2 played and player1 did not
    player2_only_dates = player2_dates - player1_dates

    # Sort the lists before returning
    return (sorted(player1_dates, key=lambda x: datetime.strptime(x, '%d/%m/%y')),
            sorted(player2_dates, key=lambda x: datetime.strptime(x, '%d/%m/%y')),
            sorted(player1_only_dates, key=lambda x: datetime.strptime(x, '%d/%m/%y')),
            sorted(player2_only_dates, key=lambda x: datetime.strptime(x, '%d/%m/%y')))


def get_player_dates(data, player_name, day_of_week=None):
    """
    Function to get the list of dates a player participated.
    :param data: The JSON data
    :param player_name: The player's name
    :param day_of_week: Optional, specify the day (Tuesday/Saturday)
    :return: Sorted list of dates in DD/MM/YY format
    """
    dates = []
    for game in data['games']:
        if player_name in game['players'] and (day_of_week is None or game['day_of_week'] == day_of_week):
            # Convert the date to DD/MM/YY format
            formatted_date = datetime.strptime(game['date'], '%Y-%m-%d').strftime('%d/%m/%y')
            dates.append(formatted_date)
    # Sort dates in ascending order
    return sorted(dates, key=lambda x: datetime.strptime(x, '%d/%m/%y'))


# ################################ teams creation ################################ #

# Create balanced teams with goalkeepers
def create_teams(players, creativity_level=1):
    goalkeepers = [p for p in players if p['position'] == 'goalkeeper']
    other_players = [p for p in players if p['position'] != 'goalkeeper']

    # Shuffle to introduce randomness
    random.shuffle(goalkeepers)
    random.shuffle(other_players)

    # Create initial teams with one goalkeeper each
    teams = [[], [], []]
    for i in range(3):
        if i < len(goalkeepers):
            teams[i].append(goalkeepers[i])  # Add one goalkeeper to each team

    # Distribute other players among teams
    for i, player in enumerate(other_players):
        teams[i % 3].append(player)

    # Adjust for creativity
    if creativity_level > 1:
        for team in teams:
            if random.random() < creativity_level * 0.1:  # Adjust creativity influence here
                random.shuffle(team)

    return teams


# Calculate diversity score
def calculate_diversity_score(teams, past_teams_data):
    score = 0
    for team in teams:
        for player in team:
            player_name = player['name']  # Ensure player_name is fetched correctly
            if player_name in past_teams_data:
                score += len(set(past_teams_data[player_name]) & set([p['name'] for p in team]))
    return score


# Save game data and update player past teams
def save_game_data(teams, data):
    # Generate game data
    game_data = {
        "date": datetime.now().strftime('%Y-%m-%d'),
        "teams": [[player['name'] for player in team] for team in teams]
    }

    # Save the game data to history
    data['games'].insert(0, game_data)  # Insert at the beginning for newest first

    # Update player past teams
    for i, team in enumerate(teams):
        for player in team:
            if 'past_teams' not in data['players'][player['name']]:
                data['players'][player['name']]['past_teams'] = []
            data['players'][player['name']]['past_teams'].append([p['name'] for p in team])

    # Save updated data to file
    save_data(data)


# Print the teams
def print_teams(teams):
    for i, team in enumerate(teams):
        print(f"Team {i + 1}:")
        for player in team:
            print(f"  {player['name']} ({player['position']}, {player['rating']})")
        print()


# Main function to execute the workflow
def main(creativity_level=1):
    # Load existing data
    data = load_data()

    # Ensure all players have the necessary attributes
    update_player_info(data['players'])

    # Ask for the game date and day type
    date_input = input("Enter the date of the game (DD.MM.YY): ").strip()
    # Convert the date to the correct format
    try:
        game_date = datetime.strptime(date_input, '%d.%m.%y').strftime('%Y-%m-%d')
    except ValueError:
        print("Invalid date format. Please enter the date in DD.MM.YY format.")
        return

    day_of_week_input = input("Enter the day of the week (T for Tuesday, S for Saturday): ").strip().upper()

    if day_of_week_input == 'T':
        day_of_week = 'Tuesday'
    elif day_of_week_input == 'S':
        day_of_week = 'Saturday'
    else:
        print("Invalid input for day of the week. Please enter 'T' for Tuesday or 'S' for Saturday.")
        return

    # Check if the game already exists
    existing_game = None
    for game in data['games']:
        if game['date'] == game_date and game['day_of_week'] == day_of_week:
            existing_game = game
            break

    if existing_game:
        print(f"Game on {game_date} ({day_of_week}) found. Using existing players for team formation.")
    else:
        print(f"No game found on {game_date} ({day_of_week}). Please make sure the game is recorded in the database.")
        return

    # Generate teams based on existing players
    selected_players = []
    for player_name in existing_game['players']:
        selected_players.append({'name': player_name, **data['players'][player_name]})

    # Generate teams
    teams = create_teams(selected_players, creativity_level)

    # Calculate and print diversity score
    diversity_score = calculate_diversity_score(teams, data['players'])
    print(f"Diversity Score: {diversity_score}")

    # Print teams
    print_teams(teams)

    # Update the existing game with the new teams
    existing_game['teams'] = [[player['name'] for player in team] for team in teams]

    # Save the updated game data back to the JSON file
    save_data(data)


# Load existing data
data = load_data()

# Run the main function with a specified creativity level
# main(creativity_level=3)  # Adjust the creativity level as needed


import tkinter as tk
from tkinter import messagebox


def show_players():
    messagebox.showinfo("Info", "Showing players...")


def prioritize_players():
    messagebox.showinfo("Info", "Prioritizing players...")


def add_new_game():
    messagebox.showinfo("Info", "Adding new game...")


def view_calendar():
    messagebox.showinfo("Info", "Viewing calendar...")


# add_game()

sort_players_only()

# sync_player_stats(data)

# update_player_info(players)
