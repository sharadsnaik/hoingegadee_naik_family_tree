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

                if existing_child:
                        print('child exist under the parent so reusing the uniqe id')
                        unique_id_gen = existing_child['uniq_id']
                else:
                        unique_id_gen = f'{father_name}_{mother_name}_{len(children_count) + 1}'
                      
                        new_children_update = {'uniq_id':unique_id_gen, 'name': data.name}
                        await collection_name_mongodb.update_one(
                        {"_id": parent["_id"]},
                        {"$push":{"children": new_children_update}}
                        # {"$addToSet":{"children": new_children_update}}
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

                # children = []
                if finding_child_count:
                       existing_names = set(child['name'] for child in finding_child_count.get('children', []))
                else : existing_names = set()
                for idx, child_nam in enumerate(data.children, start=curent_child_count):
                       if child_nam not in existing_names:
                              child_uniq_id = f'{his_name}_{his_wife_name}_{idx}'
                              children.append({"uniq_id": child_uniq_id, "name": child_nam})
              
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

       
        result =await collection_name_mongodb.insert_one(document)
        
        parent_id = result.inserted_id  # ✅ Now we have _id
        if data.wife_name:
            first_added_children_cursor = collection_name_mongodb.find({
                "father_name": data.name,
                "mother_name": data.wife_name,
                "uniq_id": {"$exists": True}
            })
        
            async for child in first_added_children_cursor:
        
                # adding child to parent's children if not already present
                await collection_name_mongodb.update_one(
                    {"_id": parent_id},
                    {"$addToSet": {
                        "children": {"uniq_id": child["uniq_id"], "name": child["name"]}
                    }}
                )
        
                # ✅ Ensure child's parent info updated
                await collection_name_mongodb.update_one(
                    {"_id": child["_id"]},
                    {"$set": {
                        "father_name": data.name,
                        "mother_name": data.wife_name
                    }}
                )
        
        return {"message": "Data saved successfully"}