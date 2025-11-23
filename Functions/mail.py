import httpx

async def send_email_(email_from, email_to, subject: str, message:str, mail_jet_api_key, mail_jet_secret)-> str:
        '''
        email_from : The from email address 

        email_to : The to email address

        MAIN Content: 
           subject:str :the subject of the message 

           message:str: The message wnat's to send
        Mail_JET_API_Key:
        
        Mail_jet_Secret:
        
        '''
        email_From = email_from
        email_To = email_to

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
                      res = await client.post(url, json= payload,auth=(mail_jet_api_key, mail_jet_secret))
                      if res.status_code in (200, 201):
                             print("✅ Mailjet: Email sent:", res.status_code)
                             return True
                      else:
                          print("❌ Mailjet response:", res.status_code, res.text)
                          return False
                  
        except Exception as e:
              print("Failed in sending email", e)
