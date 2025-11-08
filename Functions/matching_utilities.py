from deep_translator import GoogleTranslator
import re, unicodedata
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

def normalized_and_convert_to_kan(name:str) -> str:
    if not name:
        return 'unknow'
    try:
        name = unicodedata.normalize('NFKD', name)
        # print('normalized unicode name =>',name)

###################### For tarnslation #####################
       
        translated = GoogleTranslator(source='auto', target='kn').translate(name)


############# # Attempt transliteration from Kannada to Latin ######################
        # If text is not Kannada, this will just return the same text

        # transliterated = transliterate(name, sanscript.KANNADA, sanscript.ITRANS)

        # # print('translated Text =>', translated)
        # clean_name = re.sub(r'[^a-zA-Z\s]', '', transliterated).lower().strip()
        # clean_name = " ".join(clean_name.split()).lower().strip()

        # print(clean_name)
        return translated
        # return " ".join(translated.split())

    
    except Exception as e:
        return name
        # return " ".join(name.split()).lower().strip()
    
# name = input('Name => ')
# normalized_and_save(name)


# function for matching full name, just name and more 
def normalize_names(name_1:str)->str:
    
    normalized_name1 = name_1.strip().lower()

    name_1 = re.sub(r'[^a-z\s]', '', normalized_name1).split()[0]
    return name_1 if ' ' in normalized_name1 else name_1

    
    
def matching_names(name_1:str, name_2:str) -> bool:
    if not name_1 and name_2:
        return False
    name1 , name2 = normalize_names(name_1), normalize_names(name_2)
    return name1 == name2


# names =['sharad', 'Shinnu', "Govinda",'ಗೋವಿಂದ', 'ಕೃಷ್ಣ', 'ಮಾಸ್ತಿ']
# for i in names:
#     normalized_and_convert_to_kan(i)

