function * generatData() { 
    const urls = ["http://run.mocky.io/v3/6f7a76ed-d6f5-4b54-be23-bf9a141c982a","http://run.mocky.io/v3/07316365-b8d2-4574-9bc1-22b17b054e3b","http://run.mocky.io/v3/1c56213e-1191-4b47-a54f-066736165ff3"]
    let i = 0
    while (true) {
        yield fetch(urls[i%3], {
            "method": "GET",
            "headers": {
                "content-type": "application/json"
            }
        })
        .then(response => {
            return response.json();
        })
        .catch(err => {
            console.error(err);
        });
        i++;
    }
  }
class FetchApi {
    
    constructor() {
        this.generatData = generatData()
    }
    next(){
        return this.generatData.next().value
    }
}

export default FetchApi;
