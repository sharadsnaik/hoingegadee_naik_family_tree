from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import uvicorn

load_dotenv()
app = FastAPI()
app.add_middleware(
     CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    # allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Include OPTIONS for preflight
    allow_headers=["Content-Type", "Authorization"],

)
import os
client = AsyncIOMotorClient(os.getenv('mongo_uri'))
db_name = client['Family_tree_DATABASE']
collection_name_mongodb = db_name['Family_data_collection_V1']
print(f"✅ Connected to MongoDB: {db_name}")


class form_data_from_frontend(BaseModel):
        # unique_id: str
        name: str
        father_name: str
        mother_name: str
        wife_name: str
        children: list =[str]
        Phone_number: str
        adress: str

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
                # Building a logic for bypassign the genrating the unique for chikdren name if parents already added thier children name
        # if data.name == parent.get(children['name']) and data.father_name == parent.name and data.mother_name == parent.wife_name:
        #         unique_id_gen = parent['_id'].get('unique_id')

                children_count = parent.get('children', [])
                
                existing_child = next((child for child in children_count if child['name'] == data.name), None)

                if existing_child:
                        print('child exist under the parent so reusing the uniqe id')
                        unique_id_gen = existing_child['uniq_id']
                else:
                        unique_id_gen = f'{father_name}_{mother_name}_{len(children_count) + 1}'
                        print('parent exist checking number of childrent',children_count, 'and its length',{len(children_count)} )

                        new_children_update = {'uniq_id':unique_id_gen, 'name': data.name}
                        await collection_name_mongodb.update_one(
                        {"_id": parent["_id"]},
                        {"$push":{"children": new_children_update}}
                )
                print(f'His parent exists so updated in parent{parent['name']} in childern feild {data.name}')

        # Logic for adding children if user provided thier children name
        children = []
        if data.children and isinstance(data.children, list):
                his_name = data.name[:3].lower()
                his_wife_name =data.wife_name[:3].lower() if data.wife_name else "no-data"
                
                finding_child_count = await collection_name_mongodb.find_one({
                        'name': data.name,
                        'wife_name': data.wife_name
                })
                curent_child_count = len(finding_child_count.get('children', []) if finding_child_count else [])

                # '
                # children = []
                for idx, child_nam in enumerate(data.children, start=curent_child_count):
                        child_uniq_id = f'{his_name}_{his_wife_name}_{idx}'
                        children.append({"uniq_id":child_uniq_id,
                          "name": child_nam})
             
        
        # Build logic for first insertion of child later father

        

        

        document = {
            "uniq_id": unique_id_gen,
            "name": data.name,
            "father_name": data.father_name,
            "mother_name": data.mother_name,
            "wife_name": data.wife_name,
            "children": children,
            "Phone_number": data.Phone_number,
            "adress": data.adress
        }
        # collection_name_mongodb.insert_one(data.model_dump())
        await collection_name_mongodb.insert_one(document)
        # if parent:
        #         new_children_update = {'uniq_id':unique_id_gen, 'name': data.name}
        #         await collection_name_mongodb.update_one(
        #                 {"_id": parent["_id"]},
        #                 {"$push":{"children": new_children_update}}
        #         )
        #         print(f'His parent exists so updated in parent{parent['name']} in childern feild {data.name}')
        
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

@app.delete("/delete-all")
async def delete_all_data():
    result = await collection_name_mongodb.delete_many({})
    return {"message": f"Deleted {result.deleted_count} documents"}


if __name__ == '__main__':
        uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)        