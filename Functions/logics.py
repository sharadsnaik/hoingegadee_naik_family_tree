from fastapi.responses import JSONResponse
from Functions.matching_utilities import *


async def translate_to_kannnda(collection_name_mongodb)->JSONResponse:
    '''
    Function whcih tarnslate the data to kannda

    '''
    try:
        # cached = await collection_name_mongodb.find_one({"_cached_kan_data":{"$exists":True}})
        # if cached:
        #       print('Usinfg cacjed documents')
        #       data_cursor = collection_name_mongodb.find({}, {"_cached_kan_data": 1})
        #       data = await data_cursor.to_list(length=None)
        #       return JSONResponse(content=[doc["_cached_kn"] for doc in data])

        data_cursor = collection_name_mongodb.find()
        data = await data_cursor.to_list(length=None)

        translated_docs = []

        for doc in data:
            translated_data = {
                # "_id": str(doc.get("_id")),
                "uniq_id": doc.get("uniq_id"),
                "image_url": doc.get("image_url", ""),
                "name": normalized_and_convert_to_kan(doc.get("name", "")),
                "father_name": normalized_and_convert_to_kan(doc.get("father_name", "")),
                "mother_name": normalized_and_convert_to_kan(doc.get("mother_name", "")),
                "wife_name": normalized_and_convert_to_kan(doc.get("wife_name", "")),
                "Phone_number": doc.get("Phone_number", ""),
                "adress": normalized_and_convert_to_kan(doc.get("adress", "")),
                "gender": normalized_and_convert_to_kan(doc.get("gender", "")),
                "spouse_image": doc.get("spouse_image", ""),
                "partners_father_name": normalized_and_convert_to_kan(doc.get("partners_father_name", "")),
                "partners_mother_name": normalized_and_convert_to_kan(doc.get("partners_mother_name", "")),
                "spouse_adress": normalized_and_convert_to_kan(doc.get("spouse_adress", "")),
                "spouse_siblings": [
                    normalized_and_convert_to_kan(sib)
                    for sib in doc.get("spouse_siblings", [])
                ],
                "children": [
                    {
                        "uniq_id": child.get("uniq_id", ""),
                        "name": normalized_and_convert_to_kan(child.get("name", ""))
                    }
                    for child in doc.get("children", [])
                ],
            }
            
            # await collection_name_mongodb.update_one(
                # {"_id": doc["_id"]}, {"$set": {"_cached_kn": translated_data}}
            
            translated_docs.append(translated_data)

        # await asyncio.sleep(9999999999999999999999999999996234342423130)
        return JSONResponse(content=translated_docs)

    except Exception as e:
        print("❌ Error during translation:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})



def Once_translating_doc(doc: dict) -> dict:
    """Build Kannada-translated version of a document from main collection."""
    return {
        "uniq_id": doc.get("uniq_id"),
        "image_url": doc.get("image_url", ""),
        "name": normalized_and_convert_to_kan(doc.get("name", "")),
        "father_name": normalized_and_convert_to_kan(doc.get("father_name", "")),
        "mother_name": normalized_and_convert_to_kan(doc.get("mother_name", "")),
        "wife_name": normalized_and_convert_to_kan(doc.get("wife_name", "")),
        "Phone_number": doc.get("Phone_number", ""),
        "adress": normalized_and_convert_to_kan(doc.get("adress", "")),
        "gender": normalized_and_convert_to_kan(doc.get("gender", "")),
        "spouse_image": doc.get("spouse_image", ""),
        "partners_father_name": normalized_and_convert_to_kan(doc.get("partners_father_name", "")),
        "partners_mother_name": normalized_and_convert_to_kan(doc.get("partners_mother_name", "")),
        "spouse_adress": normalized_and_convert_to_kan(doc.get("spouse_adress", "")),
        "spouse_siblings": [
            normalized_and_convert_to_kan(sib)
            for sib in doc.get("spouse_siblings", [])
        ],
        "children": [
            {
                "uniq_id": child.get("uniq_id", ""),
                "name": normalized_and_convert_to_kan(child.get("name", ""))
            }
            for child in doc.get("children", [])
        ],
    }
