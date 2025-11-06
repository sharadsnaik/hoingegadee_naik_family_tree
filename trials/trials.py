# from fastapi import FastAPI
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
# from dotenv import load_dotenv
# from motor.motor_asyncio import AsyncIOMotorClient
# import uvicorn, aiosmtplib
# from email.mime.text import MIMEText
# from fastapi import HTTPException
# from bson import ObjectId

# load_dotenv()
# app = FastAPI()
# app.add_middleware(
#      CORSMiddleware,
#     allow_origins=['*'],
# #     allow_origins=["http://localhost:3000"],  
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "OPTIONS",'DELETE'],  # Include OPTIONS for preflight
#     allow_headers=["Content-Type", "Authorization"],

# )
# import os
# client = AsyncIOMotorClient(os.getenv('mongo_uri'))
# db_name = client['Family_tree_DATABASE']
# collection_name_mongodb = db_name['Family_data_collection_V1']
# print(f"✅ Connected to MongoDB: {db_name}")

# async def send_email(subject: str, message:str):
#         try:
#               email = MIMEText(message)
#               email["From"] = os.getenv("EMAIL_USER")
#               email["To"] = os.getenv("EMAIL_USER")
#               email['Subject'] = subject
       
#               await aiosmtplib.send(
#                      email,
#                      hostname=os.getenv('EMAIL_HOST'),
#                      port=int(os.getenv("EMAIL_PORT")),
#                      start_tls=True,
#                      username=os.getenv("EMAIL_USER"),
#                      password=os.getenv("EMAIL_PASS")
#               )
#         except Exception as e:
#               print("Failed in sending email", e)

# class form_data_from_frontend(BaseModel):
#         # unique_id: str
#         image_url: str | None = None
#         name: str
#         father_name: str
#         mother_name: str
#         wife_name: str
#         children: list =[str]
#         Phone_number: str
#         adress: str
#         gender: str
#         spouse_image: str | None = None

# # Saving to the data
# @app.post('/submit')
# async def submit_form(data: form_data_from_frontend):
#         print('Debiugging children ', data.children)
#         # checking the user already exsits or not 
#         existing_user = await collection_name_mongodb.find_one({
#                 "name": data.name,
#                 'father_name' : data.father_name,
#                 'mother_name': data.mother_name
#         })
#         if existing_user:
#                 return JSONResponse(
#                         status_code=409,
#                         content={'message':'User already exists'}
#                 )
        
#         # Logic for generating unique id for individual person if his parent name is not present in the whole dataset
        
#         parent = await collection_name_mongodb.find_one({
#                 'name': data.father_name,
#                 'wife_name': data.mother_name
#         })

#         father_name = data.father_name[:3].lower() if data.father_name else "no-data"
#         mother_name = data.mother_name[:3].lower() if data.mother_name else "no-data"
        
#         if not parent:      # unique id if Generating parent         
#                 unique_id_gen= f'{father_name}_{mother_name}'
#                 print('Generated unique id', unique_id_gen)
#         else:
#                 # Building a logic for bypassign the genrating the unique for chikdren name if parents already added thier children name
#         # if data.name == parent.get(children['name']) and data.father_name == parent.name and data.mother_name == parent.wife_name:
#         #         unique_id_gen = parent['_id'].get('unique_id')

#                 children_count = parent.get('children', [])
                
#                 existing_child = next((child for child in children_count if child['name'] == data.name), None)

#                 if existing_child:
#                         print('child exist under the parent so reusing the uniqe id')
#                         unique_id_gen = existing_child['uniq_id']
#                 else:
#                         unique_id_gen = f'{father_name}_{mother_name}_{len(children_count) + 1}'
#                         # print('parent exist checking number of childrent',children_count, 'and its length',{len(children_count)} )

#                         new_children_update = {'uniq_id':unique_id_gen, 'name': data.name}
#                         await collection_name_mongodb.update_one(
#                         {"_id": parent["_id"]},
#                         {"$push":{"children": new_children_update}}
#                         # {"$addToSet":{"children": new_children_update}}
#                 )
#                 print(f'His parent exists so updated in parent{parent['name']} in childern feild {data.name}')

#         # Logic for adding children if user provided thier children name
#         children = []
#         if data.children and isinstance(data.children, list):
#                 his_name = data.name[:3].lower()
#                 his_wife_name =data.wife_name[:3].lower() if data.wife_name else "no-data"
                
#                 finding_child_count = await collection_name_mongodb.find_one({
#                         'name': data.name,
#                         'wife_name': data.wife_name
#                 })
#                 curent_child_count = len(finding_child_count.get('children', []) if finding_child_count else [])

#                 # children = []
#                 if finding_child_count:
#                        existing_names = set(child['name'] for child in finding_child_count.get('children', []))
#                 else : existing_names = set()
#                 for idx, child_nam in enumerate(data.children, start=curent_child_count):
#                        if child_nam not in existing_names:
#                               child_uniq_id = f'{his_name}_{his_wife_name}_{idx}'
#                               children.append({"uniq_id": child_uniq_id, "name": child_nam})
#                 # for idx, child_nam in enumerate(data.children, start=curent_child_count):
#                 #         child_uniq_id = f'{his_name}_{his_wife_name}_{idx}'
#                 #         children.append({"uniq_id":child_uniq_id,
#                 #           "name": child_nam})
             
        
#         # Build logic for first insertion of child later father
    

#         document = {
#             "uniq_id": unique_id_gen,
#             "image_url": data.image_url,
#             "name": data.name,
#             "father_name": data.father_name,
#             "mother_name": data.mother_name,
#             "wife_name": data.wife_name,
#             "children": children,
#             "Phone_number": data.Phone_number,
#             "adress": data.adress,
#             "gender": data.gender,
#             "spouse_image": data.spouse_image
#         }

#         # Logic for child added first → Later parent added → system should automatically link the child to the parent, and reuse same uniq_id

#         # if document['wife_name']:
#         #         first_added_child= collection_name_mongodb.find({
#         #                 'father_name':document['name'],
#         #                 'mother_name':document['wife_name'],
#         #                 "uniq_id":{"$exists":True}
#         #         })

#         #         async for child in first_added_child:
#         #                 existing = next((c for c in document.get("children", []) if c["name"] == child["name"]), None)
                        
#         #                 if not existing:
#         #                         # Add to parent's children
#         #                         await collection_name_mongodb.update_one(
#         #                                 {"_id": document["_id"]},
#         #                                 {"$push": {"children": {"uniq_id": child["uniq_id"], "name": child["name"]}}}
#         #                                 )

#         # # Also ensure child's unique_id stays same and no mismatch
#         #                 await collection_name_mongodb.update_one(
#         #     {"_id": child["_id"]},
#         #     {"$set": {
#         #         "father_name": document["name"],
#         #         "mother_name": document["wife_name"]
#         #     }})


#         # collection_name_mongodb.insert_one(data.model_dump())
#         result =await collection_name_mongodb.insert_one(document)
#         # if parent:
#         #         new_children_update = {'uniq_id':unique_id_gen, 'name': data.name}
#         #         await collection_name_mongodb.update_one(
#         #                 {"_id": parent["_id"]},
#         #                 {"$push":{"children": new_children_update}}
#         #         )
#         #         print(f'His parent exists so updated in parent{parent['name']} in childern feild {data.name}')
#         parent_id = result.inserted_id  # ✅ Now we have _id
#         if data.wife_name:
#             first_added_children_cursor = collection_name_mongodb.find({
#                 "father_name": data.name,
#                 "mother_name": data.wife_name,
#                 "uniq_id": {"$exists": True}
#             })
        
#             async for child in first_added_children_cursor:
        
#                 # adding child to parent's children if not already present
#                 await collection_name_mongodb.update_one(
#                     {"_id": parent_id},
#                     {"$addToSet": {
#                         "children": {"uniq_id": child["uniq_id"], "name": child["name"]}
#                     }}
#                 )
        
#                 # ✅ Ensure child's parent info updated
#                 await collection_name_mongodb.update_one(
#                     {"_id": child["_id"]},
#                     {"$set": {
#                         "father_name": data.name,
#                         "mother_name": data.wife_name
#                     }}
#                 )
#         # LOgic for counting the number of member are using the service
#         total_members = await collection_name_mongodb.count_documents({})
#         print('total members in doc',total_members)
#         if total_members % 5 == 0:
#                last_5_cursor = collection_name_mongodb.find({}, {"name": 1}).sort("_id", -1).limit(5)
#                last_5_names = []
#                async for member in last_5_cursor:
#                    last_5_names.append(member.get("name", "Unknown"))
               
#                names_list_str = "\n".join([f"{idx+1}. {name}" for idx, name in enumerate(last_5_names)])
               
#                message = (
#                    f"🎉 New Members Added!\n\n"
#                    f"Total Members Now: {total_members}\n\n"
#                    f"Latest 5 Members:\n{names_list_str}"
#                )
#                await send_email(
#                       subject="NEW MEMBERS ARE ADDED!!! 🎊🎊",
#                       message=message
#                 #       message=f"🎉 Total {total_members} members now!\nLatest Member: {data.name}"
#                )
#                print("📩 Email Notification Sent with last 5 member names!")

#         return {"message": "Data saved successfully"}

# @app.get('/fetch', response_model=List[dict])
# async def fetch_data():
#         try:
#                 data = collection_name_mongodb.find()
#                 data = await data.to_list()
#                 for doc in data:
#                         doc['_id'] = str(doc['_id']) # Convert ObjectId to string
#                 return JSONResponse(content=data)
#         except Exception as e:
#                 return JSONResponse(status_code=500, content={"error": str(e)})
# # Optional delete all the itmes in collection 

# @app.delete("/delete/uniq{uniq_id}")
# async def delete_member(uniq_id: str):

#     # ✅ Find member
#     person = await collection_name_mongodb.find_one({"uniq_id": uniq_id})
#     if not person:
#         raise HTTPException(status_code=404, detail="Member not found")

#     #  Remov from parent's children list
#     name_to_delete = person.get('name')
#     father_name = person.get("father_name")
#     mother_name = person.get("mother_name")

#     await collection_name_mongodb.update_many(
#         {"children.name": name_to_delete},
#         {"$pull": {"children": {"name": name_to_delete}}}
#     )

#     # ✅ Handle person's own children → unlink their parents
#     await collection_name_mongodb.update_many(
#         {"father_name": name_to_delete},
#         {"$set": {"father_name": "unknown"}}
#     )

#     await collection_name_mongodb.update_many(
#         {"mother_name": name_to_delete},
#         {"$set": {"mother_name": "unknown"}}
#     )

#     # ✅ Finally delete the person
#     result = await collection_name_mongodb.delete_one({"uniq_id": uniq_id})

#     if result.deleted_count == 0:
#         raise HTTPException(status_code=500,
#                             detail="Delete failed due to unexpected error")

#     return {"message": f"✅ Member '{name_to_delete}' deleted successfully"}

    

# @app.delete("/delete-all")
# async def delete_all_data():
#     result = await collection_name_mongodb.delete_many({})
#     return {"message": f"Deleted {result.deleted_count} documents"}


# if __name__ == '__main__':
#         uvicorn.run('trials:app', host='127.0.0.1', port=8000, reload=True)        



# from fastapi import FastAPI
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from typing import List
# from dotenv import load_dotenv
# from motor.motor_asyncio import AsyncIOMotorClient
# import uvicorn, httpx,os, re
# from fastapi import HTTPException
# from contextlib import asynccontextmanager
# from Functions.matching_utilities import normalized_and_convert_to_kan,normalize_names, matching_names


# load_dotenv()

# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """Connect to MongoDB once on startup."""
#     global client, collection_name_mongodb
#     client = AsyncIOMotorClient(os.getenv("mongo_uri"), maxPoolSize=10)
#     db = client["Family_tree_DATABASE"]
#     collection_name_mongodb = db["Family_data_collection_V1"]
#     # Quick warmup query
#     await collection_name_mongodb.find_one({})
#     print("✅ MongoDB connected & warmed up")
#     try:
#           yield
#     finally:
#           client.close()
#           print('connection closed')

# app = FastAPI(lifespan=lifespan)
# app.add_middleware(
#      CORSMiddleware,
#     allow_origins=['http://localhost:3000',
#                    'https://hoingegadee-naik-family-tree-1.onrender.com',
#                    'http://192.168.1.39'],  #Phone ip],
#     allow_credentials=True,
#     allow_methods=["*"],  # Include OPTIONS for preflight
#     allow_headers=["*"])


# async def send_email(subject: str, message:str):
#         email_From = os.getenv("EMAIL_USER")
#         email_To = os.getenv("EMAIL_USER")

#         url = 'https://api.mailjet.com/v3.1/send'
#         payload = {
#         "Messages": [
#             {
#                 "From": {"Email": email_From, "Name": "Family App"},
#                 "To": [{"Email": email_To, "Name": "Admin"}],
#                 "Subject": subject,
#                 "TextPart": message,
#                 # "HTMLPart": "<h3>HTML message</h3>",   # optional
#             }
#         ]
#     }

#         try:
#                async with httpx.AsyncClient(timeout= 10.0) as client:
#                       res = await client.post(url, json= payload,auth=(os.getenv('MAILJET_API_KEY'),os.getenv('MAILJET_API_SECRET')))
#                       if res.status_code in (200, 201):
#                              print("✅ Mailjet: Email sent:", res.status_code)
#                              return True
#                       else:
#                           print("❌ Mailjet response:", res.status_code, res.text)
#                           return False
                  
#         except Exception as e:
#               print("Failed in sending email", e)


# class form_data_from_frontend(BaseModel):
#         image_url: str | None = None
#         name: str
#         father_name: str
#         mother_name: str
#         wife_name: str
#         children: list =[str]
#         Phone_number: str
#         adress: str
#         gender: str
#         spouse_image: str | None = None

# # Saving to the data
# @app.post('/submit')
# async def submit_form(data: form_data_from_frontend):
#         print('Debiugging children ', data.children)
#         # checking the user already exsits or not 
#         existing_user = await collection_name_mongodb.find_one({
#                 "name": data.name,
#                 'father_name' : data.father_name,
#                 'mother_name': data.mother_name
#         })
#         if existing_user:
#                 return JSONResponse(
#                         status_code=409,
#                         content={'message':'User already exists'}
#                 )
        
#         # Logic for generating unique id for individual person if his parent name is not present in the whole dataset
        
#         parent = await collection_name_mongodb.find_one({
#                 'name': data.father_name,
#                 'wife_name': data.mother_name
#         })

#         father_name = data.father_name[:3].lower() if data.father_name else "no-data"
#         mother_name = data.mother_name[:3].lower() if data.mother_name else "no-data"
        
#         if not parent:      # unique id if Generating parent         
#                 unique_id_gen= f'{father_name}_{mother_name}'
#                 print('Generated unique id', unique_id_gen)
#         else:
#                 children_count = parent.get('children', [])
                
#                 existing_child = next((child for child in children_count if child['name'] == data.name), None)

#                 # NEW: If no exact match, check fuzzy match using matching_names
#                 if not existing_child:
#                       existing_child = next((child for child in children_count if matching_names(child['name'], data.name)), None)

#                 if existing_child:
#                         print('child exist under the parent so reusing the uniqe id')
#                         unique_id_gen = existing_child['uniq_id']

#                         await collection_name_mongodb.update_one(
#                               {"_id": parent["_id"], "children.uniq_id": unique_id_gen},
#                               {"$set": {"children.$.name": data.name}}
#             )
#                 else:
#                         unique_id_gen = f'{father_name}_{mother_name}_{len(children_count) + 1}'

#                         new_children_update = {'uniq_id':unique_id_gen, 'name': data.name}
#                         await collection_name_mongodb.update_one(
#                         {"_id": parent["_id"]},
#                         {"$push":{"children": new_children_update}} )
                
#         # Logic for adding children if user provided thier children name
#         children = []
#         if data.children and isinstance(data.children, list):
#                 his_name = data.name[:3].lower()
#                 his_wife_name =data.wife_name[:3].lower() if data.wife_name else "no-data"

#                 # NEW: Fetch all existing child documents with matching parents (to detect duplicates and get accurate count)
#                 existing_children_cursor = collection_name_mongodb.find({
#                     'father_name': data.name,
#                     'mother_name': data.wife_name
#                 })
#                 existing_children_docs = await existing_children_cursor.to_list(length=None)
                
#                 # Use count of existing child docs for indexing new ones
#                 current_child_count = len(existing_children_docs)
                
#                 # NEW: Build set of normalized names for quick lookup, but we'll use matching_names for fuzzy check
#                 existing_normalized_names = {normalize_names(doc['name']) for doc in existing_children_docs}
                
#                 added_count = 0  # Track how many new we're adding for indexing
#                 for child_nam in data.children:
#                     if not child_nam:
#                         continue
                    
#                     # NEW: Check for existing match using matching_names
#                     match_found = any(matching_names(doc['name'], child_nam) for doc in existing_children_docs)
                    
#                     if not match_found:
#                         # No match: Generate new uniq_id and add
#                         idx = current_child_count + added_count
#                         child_uniq_id = f'{his_name}_{his_wife_name}_{idx}'
#                         children.append({"uniq_id": child_uniq_id, "name": child_nam})
#                         added_count += 1
                        
                
               

#         # Build logic for first insertion of child later father
    

#         document = {
#             "uniq_id": unique_id_gen,
#             "image_url": data.image_url,
#             "name": data.name,
#             "father_name": data.father_name,
#             "mother_name":data.mother_name,
#             "wife_name": data.wife_name,
#             "children":children,
#             "Phone_number": data.Phone_number,
#             "adress": data.adress,
#             "gender":data.gender,
#             "spouse_image": data.spouse_image
#         }

#         # Logic for child added first → Later parent added → system should automatically link the child to the parent, and reuse same uniq_id

#         result =await collection_name_mongodb.insert_one(document)

#         parent_id = result.inserted_id  # ✅ Now we have _id
#         if data.wife_name:
#             father_prefix = data.name[:3].lower()
#             mother_prefix = (data.wife_name or '')[:3].lower()
            
#             all_related_child = collection_name_mongodb.find({
#         "father_name": {"$regex": f"^{father_prefix}", "$options": "i"},
#         "mother_name": {"$regex": f"^{mother_prefix}", "$options": "i"},
#         "uniq_id": {"$exists": True}
#     })
        
#             async for child in all_related_child:
        
#                 # adding child to parent's children if not already present
#                 if matching_names(child.get('father_name'), data.name) and matching_names(child.get('mother_name'), data.wife_name):
#                       await collection_name_mongodb.update_one(
#                     {"_id": parent_id},
#                     {"$addToSet": {
#                         "children": {"uniq_id": child["uniq_id"], "name": child["name"]}
#                     }}
#                 )
        
#                 # ✅ Ensure child's parent info updated
#                 #       await collection_name_mongodb.update_one(
#                 #     {"_id": child["_id"]},
#                 #     {"$set": {
#                 #         "father_name": data.name,
#                 #         "mother_name": data.wife_name
#                 #     }}
#                 # )
#                 #       print('alstt same child foudn')

# # Logic for handling if parent add manually childs (especially child is present and parent re-add )
#         if data.children:
#               checking_existing_child = collection_name_mongodb.find(
#                     {'father_name':data.name,
#                     'mother_name':data.wife_name}
#               )
#               existing_children_normalized_names = set()
#               async for c in checking_existing_child:
#                   existing_children_normalized_names.add(normalize_names(c.get('name', '')))
              
#               for idx, child_entry in enumerate(data.children):
#                   child_name = child_entry.get("name") if isinstance(child_entry, dict) else str(child_entry)
#                   if not child_name:
#                       continue
                  
#                   # FIXED: Add parent filters to query, use $regex for name flexibility (adjust as needed)
#                   existing_child_doc = await collection_name_mongodb.find_one({
#                       "name": {"$regex": re.escape(normalize_names(child_name)), "$options": "i"},
#                       "father_name": data.name,
#                       "mother_name": data.wife_name
#                   })
#                   if existing_child_doc:
#                       await collection_name_mongodb.update_one(
#                           {"_id": parent_id},
#                           {"$addToSet": {
#                               "children": {"uniq_id": existing_child_doc["uniq_id"], "name": existing_child_doc["name"]}
#                           }}
#                       )
         
#         # LOgic for counting the number of member are using the service
#         total_members = await collection_name_mongodb.count_documents({})
#         if total_members % 5 == 0:
#                last_5_cursor = collection_name_mongodb.find({}, {"name": 1}).sort("_id", -1).limit(5)
#                last_5_names = []
#                async for member in last_5_cursor:
#                    last_5_names.append(member.get("name", "Unknown"))
               
#                names_list_str = "\n".join([f"{idx+1}. {name}" for idx, name in enumerate(last_5_names)])
               
#                message = (
#                    f"🎉 New Members Added!\n\n"
#                    f"Total Members Now: {total_members}\n\n"
#                    f"Latest 5 Members:\n{names_list_str}"
#                )
#                await send_email(
#                       subject="NEW MEMBERS ARE ADDED!!! 🎊🎊",
#                       message=message
#                 #       message=f"🎉 Total {total_members} members now!\nLatest Member: {data.name}"
#                )
#                print("📩 Email Notification Sent with last 5 member names!")

#         return {"message": "Data saved successfully"}

# @app.get('/fetch', response_model=List[dict])
# async def fetch_data():
#         try:
#                 data = collection_name_mongodb.find()
#                 data = await data.to_list()
#                 for doc in data:
#                         doc['_id'] = str(doc['_id']) # Convert ObjectId to string
#                 return JSONResponse(content=data)
#         except Exception as e:
#                 return JSONResponse(status_code=500, content={"error": str(e)})
# # Optional delete all the itmes in collection 

# @app.delete("/delete/uniq{uniq_id}")
# async def delete_member(uniq_id: str):

#     # ✅ Find member
#     person = await collection_name_mongodb.find_one({"uniq_id": uniq_id})
#     if not person:
#         raise HTTPException(status_code=404, detail="Member not found")

#     #  Remov from parent's children list
#     name_to_delete = person.get('name')
#     father_name = person.get("father_name")
#     mother_name = person.get("mother_name")

#     await collection_name_mongodb.update_many(
#         {"children.name": name_to_delete},
#         {"$pull": {"children": {"name": name_to_delete}}}
#     )

#     # ✅ Handle person's own children → unlink their parents
#     # await collection_name_mongodb.update_many(
#     #     {"father_name": name_to_delete},
#     #     {"$set": {"father_name": "unknown"}}
#     # )

#     # await collection_name_mongodb.update_many(
#     #     {"mother_name": name_to_delete},
#     #     {"$set": {"mother_name": "unknown"}}
#     # )

#     # ✅ Finally delete the person
#     result = await collection_name_mongodb.delete_one({"uniq_id": uniq_id})

#     if result.deleted_count == 0:
#         raise HTTPException(status_code=500,
#                             detail="Delete failed due to unexpected error")

#     return {"message": f"✅ Member '{name_to_delete}' deleted successfully"}

    

# @app.delete("/delete-all")
# async def delete_all_data():
#     result = await collection_name_mongodb.delete_many({})
#     return {"message": f"Deleted {result.deleted_count} documents"}
# @app.get("/ping")
# async def ping():
#     return {"status": "alive"}


# if __name__ == '__main__':
#         uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)        



# # V2


from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import uvicorn, httpx,os, re
from fastapi import HTTPException
from contextlib import asynccontextmanager
from Functions.matching_utilities import normalized_and_convert_to_kan,normalize_names, matching_names


load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Connect to MongoDB once on startup."""
    global client, collection_name_mongodb
    client = AsyncIOMotorClient(os.getenv("mongo_uri"), maxPoolSize=10)
    db = client["Family_tree_DATABASE"]
    collection_name_mongodb = db["Family_data_collection_V1"]
    # Quick warmup query
    await collection_name_mongodb.find_one({})
    print("✅ MongoDB connected & warmed up")
    try:
          yield
    finally:
          client.close()
          print('connection closed')

app = FastAPI(lifespan=lifespan)
app.add_middleware(
     CORSMiddleware,
    allow_origins=['http://localhost:3000',
                   'https://hoingegadee-naik-family-tree-1.onrender.com',
                   'http://192.168.1.39'],  #Phone ip],
    allow_credentials=True,
    allow_methods=["*"],  # Include OPTIONS for preflight
    allow_headers=["*"])


async def send_email(subject: str, message:str):
        email_From = os.getenv("EMAIL_USER")
        email_To = os.getenv("EMAIL_USER")

        url = 'https://api.mailjet.com/v3.1/send'
        payload = {
        "Messages": [
            {
                "From": {"Email": email_From, "Name": "Family App"},
                "To": [{"Email": email_To, "Name": "Admin"}],
                "Subject": subject,
                "TextPart": message,
                # "HTMLPart": "<h3>HTML message</h3>",   # optional
            }
        ]
    }

        try:
               async with httpx.AsyncClient(timeout= 10.0) as client:
                      res = await client.post(url, json= payload,auth=(os.getenv('MAILJET_API_KEY'),os.getenv('MAILJET_API_SECRET')))
                      if res.status_code in (200, 201):
                             print("✅ Mailjet: Email sent:", res.status_code)
                             return True
                      else:
                          print("❌ Mailjet response:", res.status_code, res.text)
                          return False
                  
        except Exception as e:
              print("Failed in sending email", e)


class form_data_from_frontend(BaseModel):
        image_url: str | None = None
        name: str
        father_name: str
        mother_name: str
        wife_name: str
        children: list =[str]
        Phone_number: str
        adress: str
        gender: str
        spouse_image: str | None = None

# Saving to the data
@app.post('/submit')
async def submit_form(data: form_data_from_frontend):
        print('Debiugging children ', data.children)
        # checking the user already exsits or not 
        existing_user = await collection_name_mongodb.find_one({
                "name": data.name,
                'father_name' : data.father_name,
                'mother_name': data.mother_name
        })
        if existing_user:
                return JSONResponse(
                        status_code=409,
                        content={'message':'User already exists'}
                )
        
        # Logic for generating unique id for individual person if his parent name is not present in the whole dataset
        
        parent = await collection_name_mongodb.find_one({
                'name': data.father_name,
                'wife_name': data.mother_name
        })

        father_name = data.father_name[:3].lower() if data.father_name else "no-data"
        mother_name = data.mother_name[:3].lower() if data.mother_name else "no-data"
        
        if not parent:      # unique id if Generating parent         
                unique_id_gen= f'{father_name}_{mother_name}'
                print('Generated unique id', unique_id_gen)
        else:
                children_count = parent.get('children', [])
                
                existing_child = next((child for child in children_count if child['name'] == data.name), None)

                # NEW: If no exact match, check fuzzy match using matching_names
                if not existing_child:
                      existing_child = next((child for child in children_count if matching_names(child['name'], data.name)), None)

                if existing_child:
                        print('child exist under the parent so reusing the uniqe id')
                        unique_id_gen = existing_child['uniq_id']

                        await collection_name_mongodb.update_one(
                              {"_id": parent["_id"], "children.uniq_id": unique_id_gen},
                              {"$set": {"children.$.name": data.name}}
            )
                else:
                        unique_id_gen = f'{father_name}_{mother_name}_{len(children_count) + 1}'

                        new_children_update = {'uniq_id':unique_id_gen, 'name': data.name}
                        await collection_name_mongodb.update_one(
                        {"_id": parent["_id"]},
                        {"$push":{"children": new_children_update}} )
                
        # Logic for adding children if user provided thier children name
        children = []
        if data.children and isinstance(data.children, list):
                his_name = data.name[:3].lower()
                his_wife_name =data.wife_name[:3].lower() if data.wife_name else "no-data"

                # NEW: Fetch all existing child documents with matching parents (to detect duplicates and get accurate count)
                existing_children_cursor = collection_name_mongodb.find({
                    'father_name': data.name,
                    'mother_name': data.wife_name
                })
                existing_children_docs = await existing_children_cursor.to_list(length=None)
                
                # Use count of existing child docs for indexing new ones
                current_child_count = len(existing_children_docs)
                
                # NEW: Build set of normalized names for quick lookup, but we'll use matching_names for fuzzy check
                existing_normalized_names = {normalize_names(doc['name']) for doc in existing_children_docs}
                
                added_count = 0  # Track how many new we're adding for indexing
                for child_nam in data.children:
                    if not child_nam:
                        continue
                    
                    # NEW: Check for existing match using matching_names
                    match_found = any(matching_names(doc['name'], child_nam) for doc in existing_children_docs)
                    
                    if not match_found:
                        # No match: Generate new uniq_id and add
                        idx = current_child_count + added_count
                        child_uniq_id = f'{his_name}_{his_wife_name}_{idx}'
                        children.append({"uniq_id": child_uniq_id, "name": child_nam})
                        added_count += 1
                        
                
               

        # Build logic for first insertion of child later father
    

        document = {
            "uniq_id": unique_id_gen,
            "image_url": data.image_url,
            "name": data.name,
            "father_name": data.father_name,
            "mother_name":data.mother_name,
            "wife_name": data.wife_name,
            "children":children,
            "Phone_number": data.Phone_number,
            "adress": data.adress,
            "gender":data.gender,
            "spouse_image": data.spouse_image
        }

        # Logic for child added first → Later parent added → system should automatically link the child to the parent, and reuse same uniq_id

        result =await collection_name_mongodb.insert_one(document)

        parent_id = result.inserted_id  # ✅ Now we have _id
        if data.wife_name:
            father_prefix = data.name[:3].lower()
            mother_prefix = (data.wife_name or '')[:3].lower()
            
            all_related_child = collection_name_mongodb.find({
        "father_name": {"$regex": f"^{father_prefix}", "$options": "i"},
        "mother_name": {"$regex": f"^{mother_prefix}", "$options": "i"},
        "uniq_id": {"$exists": True}
    })
        
            async for child in all_related_child:
        
                # adding child to parent's children if not already present
                if matching_names(child.get('father_name'), data.name) and matching_names(child.get('mother_name'), data.wife_name):
                      await collection_name_mongodb.update_one(
                    {"_id": parent_id},
                    {"$addToSet": {
                        "children": {"uniq_id": child["uniq_id"], "name": child["name"]}
                    }}
                )
        
                # ✅ Ensure child's parent info updated
                #       await collection_name_mongodb.update_one(
                #     {"_id": child["_id"]},
                #     {"$set": {
                #         "father_name": data.name,
                #         "mother_name": data.wife_name
                #     }}
                # )
                #       print('alstt same child foudn')

# Logic for handling if parent add manually childs (especially child is present and parent re-add )
        if data.children:
              checking_existing_child = collection_name_mongodb.find(
                    {'father_name':data.name,
                    'mother_name':data.wife_name}
              )
              existing_children_normalized_names = set()
              async for c in checking_existing_child:
                  existing_children_normalized_names.add(normalize_names(c.get('name', '')))
              
              for idx, child_entry in enumerate(data.children):
                  child_name = child_entry.get("name") if isinstance(child_entry, dict) else str(child_entry)
                  if not child_name:
                      continue
                  
                  # FIXED: Add parent filters to query, use $regex for name flexibility (adjust as needed)
                  existing_child_doc = await collection_name_mongodb.find_one({
                      "name": {"$regex": re.escape(normalize_names(child_name)), "$options": "i"},
                      "father_name": data.name,
                      "mother_name": data.wife_name
                  })
                  if existing_child_doc:
                      await collection_name_mongodb.update_one(
                          {"_id": parent_id},
                          {"$addToSet": {
                              "children": {"uniq_id": existing_child_doc["uniq_id"], "name": existing_child_doc["name"]}
                          }}
                      )
         
        # LOgic for counting the number of member are using the service
        total_members = await collection_name_mongodb.count_documents({})
        if total_members % 5 == 0:
               last_5_cursor = collection_name_mongodb.find({}, {"name": 1}).sort("_id", -1).limit(5)
               last_5_names = []
               async for member in last_5_cursor:
                   last_5_names.append(member.get("name", "Unknown"))
               
               names_list_str = "\n".join([f"{idx+1}. {name}" for idx, name in enumerate(last_5_names)])
               
               message = (
                   f"🎉 New Members Added!\n\n"
                   f"Total Members Now: {total_members}\n\n"
                   f"Latest 5 Members:\n{names_list_str}"
               )
               await send_email(
                      subject="NEW MEMBERS ARE ADDED!!! 🎊🎊",
                      message=message
                #       message=f"🎉 Total {total_members} members now!\nLatest Member: {data.name}"
               )
               print("📩 Email Notification Sent with last 5 member names!")

        return {"message": "Data saved successfully"}

@app.get('/fetch', response_model=List[dict])
async def fetch_data():
        try:
                data = collection_name_mongodb.find()
                data = await data.to_list()
                for doc in data:
                        doc['_id'] = str(doc['_id']) # Convert ObjectId to string
                return JSONResponse(content=data)
        except Exception as e:
                return JSONResponse(status_code=500, content={"error": str(e)})
# Optional delete all the itmes in collection 

@app.delete("/delete/uniq{uniq_id}")
async def delete_member(uniq_id: str):

    # ✅ Find member
    person = await collection_name_mongodb.find_one({"uniq_id": uniq_id})
    if not person:
        raise HTTPException(status_code=404, detail="Member not found")

    #  Remov from parent's children list
    name_to_delete = person.get('name')
    father_name = person.get("father_name")
    mother_name = person.get("mother_name")

    await collection_name_mongodb.update_many(
        {"children.name": name_to_delete},
        {"$pull": {"children": {"name": name_to_delete}}}
    )

    # ✅ Handle person's own children → unlink their parents
    # await collection_name_mongodb.update_many(
    #     {"father_name": name_to_delete},
    #     {"$set": {"father_name": "unknown"}}
    # )

    # await collection_name_mongodb.update_many(
    #     {"mother_name": name_to_delete},
    #     {"$set": {"mother_name": "unknown"}}
    # )

    # ✅ Finally delete the person
    result = await collection_name_mongodb.delete_one({"uniq_id": uniq_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=500,
                            detail="Delete failed due to unexpected error")

    return {"message": f"✅ Member '{name_to_delete}' deleted successfully"}

    

@app.delete("/delete-all")
async def delete_all_data():
    result = await collection_name_mongodb.delete_many({})
    return {"message": f"Deleted {result.deleted_count} documents"}
@app.get("/ping")
async def ping():
    return {"status": "alive"}


if __name__ == '__main__':
        uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)        