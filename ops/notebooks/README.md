### open as a devcontainer

at the prompt load the libraries
```bash
pip install -r requirements.txt
```

Get a _.jupysql/connections.ini_ file from someone or create one for vans

and then start the jupyter notebook server
```bash
jupyter notebook --ip=0.0.0.0 --port=8080 --allow-root
```

you'll see links in the terminal window like
```  http://127.0.0.1:8080/tree?token=527e40433efd94de523c```

**command click on that to open in a browser**

open the _vans.ipynb_


```bash
sudo apt-get update
```
```bash
sudo apt-get install apt-transport-https ca-certificates gnupg curl
```
```bash
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
```
```bash
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
```
```bash
sudo apt-get update && sudo apt-get install google-cloud-cli
```
```bash
RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && apt-get update -y && apt-get install google-cloud-sdk -y
```
```bash
gcloud init
```
```bash
gcloud auth application-default login
```
