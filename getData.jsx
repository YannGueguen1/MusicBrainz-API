const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num);
  const list = pages.map(page => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log(result.data.artists)
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets data from Hacker News url
function App() {
  const startName="jackson"
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState(startName);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    `https://musicbrainz.org/ws/2/artist/?query=${startName}&fmt=json`,
    {
      artists: []
    }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.artists;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    // console.log(`currentPage: ${currentPage}`);
  }
  return (
    <Fragment>
      <form
        onSubmit={event => {
          doFetch(`https://musicbrainz.org/ws/2/artist/?query=${query}&fmt=json`);
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ol className="main-list">
          {page.map(item => (
            <li key={item.id} className="person-list">
              <div><span className="person-name">{item.name}</span><span>{item.hasOwnProperty('aliases') && false ? ", a.k.a " + item.aliases[0].name : ""}</span></div>
              <div>Person or group: {item.type}</div>
              <div>Birth: {item["life-span"].begin}{item.hasOwnProperty('begin-area') && item.hasOwnProperty('country') ? ` in ${item["begin-area"].name}, ${item.country}` : ""}</div>
              <div>Death: {item["life-span"].ended==true && item.type=="Person" ? item["life-span"].end : "-"}</div>
            </li>
          ))}
        </ol>
      )}
      <Pagination
        items={data.artists}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
