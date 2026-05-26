from sqlalchemy import create_engine 
from dotenv import load_dotenv
import os 
print("DEBUG: database.py loaded")
print(create_engine)
load_dotenv()

DB_Host = os.getenv("DB_HOST")
DB_User = os.getenv("DB_USER")
DB_Password = os.getenv("DB_PASSWORD")
DB_Port = os.getenv("DB_PORT")
DB_Name = os.getenv("DB_NAME")

DB_Connection = (
    f"postgresql+psycopg2://{DB_User}:{DB_Password}"
    f"@{DB_Host}:{DB_Port}/{DB_Name}"
)

engine = create_engine(DB_Connection)