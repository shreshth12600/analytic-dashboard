from sqlalchemy import create_engine 
from dotenv import load_dotenv
import os 

load_dotenv()

DB_Host = os.getenv("DB_HOST")
DB_User = os.getenv("DB_USER")
DB_Password = os.getenv("DB_PASSWORD")
DB_Port = os.getenv("DB_PORT")
DB_Name = os.getenv("DB_NAME")


print("DB_HOST =", DB_Host)
print("DB_USER =", DB_User)
print("DB_PORT =", DB_Port)
print("DB_NAME =", DB_Name)

DB_Connection = (
    f"postgresql+psycopg2://{DB_User}:{DB_Password}"
    f"@{DB_Host}:{DB_Port}/{DB_Name}"
)

engine = create_engine(DB_Connection)