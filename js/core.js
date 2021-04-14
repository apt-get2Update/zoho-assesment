'use strict';

function * generatData() { 
    const urls = ["https://run.mocky.io/v3/6f7a76ed-d6f5-4b54-be23-bf9a141c982a","https://run.mocky.io/v3/07316365-b8d2-4574-9bc1-22b17b054e3b","https://run.mocky.io/v3/1c56213e-1191-4b47-a54f-066736165ff3"];
    let i = 0;
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
        this.generatData = generatData();
    }
    next(){
        return this.generatData.next().value
    }
}

class Core {
  data = [];
  isGridView = false;
  search = null;
  sortColumn = null;
  sortbyAsc = true;
  constructor(_parent) {
    this.parentNode = _parent;
    this.fetchData = new FetchApi();
    this.grid = this.parentNode.querySelector("#grid");
    this.table = this.parentNode.querySelector("#table");
    this.registerEvents();
    this.fetchNextPage();
  }
  registerEvents() {
    const gridElmt = this.grid;
    const tableBody = this.table.querySelector("tbody");

    //toggle view
    document
      .getElementById("table-btn")
      .addEventListener("click", (e) => this.handleView(e, "table"));
    document
      .getElementById("grid-btn")
      .addEventListener("click", (e) => this.handleView(e, "grid"));

    //sorting tableview
    this.table
      .querySelector("thead > tr > th:nth-child(2) > a")
      .addEventListener("click", (e) => {
        this.handleSort("name");
      });
    this.table
      .querySelector("thead > tr > th:nth-child(3) > a")
      .addEventListener("click", (e) => {
        this.handleSort("description");
      });

    //scroll listeners
    gridElmt.addEventListener("scroll", () => {
      if (gridElmt.scrollTop + gridElmt.clientHeight >= gridElmt.scrollHeight) {
        this.fetchNextPage();
      }
    });
    tableBody.addEventListener("scroll", () => {
      if (
        tableBody.scrollTop + tableBody.clientHeight >=
        tableBody.scrollHeight
      ) {
        this.fetchNextPage();
      }
    });

    //search Listerner
    document
      .querySelector("input")
      .addEventListener("keyup", (e) => this.handleSearch(e));
  }
  handleSort(key) {
    this.sortbyAsc = this.sortbyAsc == "asc" ? "desc" : "asc";
    this.data.sort((a, b) => {
      if (a[key] < b[key]) {
        return this.sortbyAsc == "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return this.sortbyAsc == "asc" ? 1 : -1;
      }
      return 0;
    });
    this.renderPage();
  }
  handleSearch(e) {
    let value = e.target.value;
    this.search = value;
    this.renderPage();
  }
  handleView(e, view) {
    if (view == "table") {
      this.isGridView = false;
      document.getElementById("table-btn").className = "btn active";
      document.getElementById("grid-btn").className = "btn";
    } else {
      this.isGridView = true;
      document.getElementById("grid-btn").className = "btn active";
      document.getElementById("table-btn").className = "btn";
    }
    this.renderPage();
  }
  fetchNextPage() {
    this.fetchData.next().then((d) => {
      if (this.data.push.length + d.length > 80) {
        this.data = this.data.slice(d.length).concat(d);
      } else {
        this.data = this.data.concat(d);
      }
      this.renderPage();
    });
  }
  renderDescription(description) {
    const p = document.createElement("p");
    p.className = "description";
    p.innerText = description;
    return p;
  }
  renderName(name) {
    const h5 = document.createElement("h5");
    h5.className = "name";
    h5.innerHTML = name;
    return h5;
  }
  renderImage(imageUrl) {
    const image = document.createElement("img");
    image.className = "image";
    image.src = imageUrl;
    return image;
  }
  renderContent(d) {
    const div = document.createElement("div");
    div.className = "grid-item";
    div.append(this.renderImage(d.image));
    div.append(this.renderName(d.name));
    div.append(this.renderDescription(d.description));
    return div;
  }
  renderColumn(v, name) {
    const tr = document.createElement("td");
    tr.className = "column";
    if (name == "name") {
      tr.append(this.renderName(v));
    }
    if (name == "image") {
      tr.append(this.renderImage(v));
    }
    if (name == "description") {
      tr.append(this.renderDescription(v));
    }
    return tr;
  }
  renderRow(d) {
    const tr = document.createElement("tr");
    tr.className = "row";
    tr.append(this.renderColumn(d.image, "image"));
    tr.append(this.renderColumn(d.name, "name"));
    tr.append(this.renderColumn(d.description, "description"));
    return tr;
  }
  filters(data) {
    if (
      this.search == null ||
      this.search.length == 0 ||
      this.search == undefined
    )
      return true;
    return (
      data.name.search(this.search) >= 0 ||
      data.description.search(this.search) >= 0
    );
  }

  renderPage() {
    if (this.isGridView) {
      this.table.style.display = "none";
      this.grid.style.display = "grid";
      this.grid.innerHTML = "";
      this.data
        .filter((d) => this.filters(d))
        .map((d) => {
          this.grid.append(this.renderContent(d));
        });
    } else {
      this.table.style.display = "table";
      this.grid.style.display = "none";
      const body = this.table.querySelector("tbody");
      body.innerHTML = "";

      this.data
        .filter((d) => this.filters(d))
        .map((d) => {
          body.append(this.renderRow(d));
        });
    }
  }
}

new Core(document.getElementById("root"));
