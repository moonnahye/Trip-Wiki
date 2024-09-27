import Header from "./components/Header.js";
import RegionList from "./components/RegionList.js";
import CityList from "./components/CityList.js";
import CityDetail from "./components/CityDetail.js";

import { request, requestCityDetail } from "./components/api.js";

export default function App($app) {

  const getSortBy = () =>{
    if(window.location.search){
      return window.location.search.split('sort=')[1].split('&')[0];
    }
    return 'total';

  }
  const getSearchWord = () =>{
    if(window.location.search && window.location.search.includes('search=')){
      return window.location.search.split('search=')[1];
    }
    return '';
  }
  this.state = {
    startIndex: 0,
    sortBy: getSortBy(),
    searchWord: getSearchWord(),
    region: "",
    cities: "",
    currentPage: window.location.pathname,
  };

  const renderHeader =  () =>{
    new Header({
      $app,
      initialState: {
        sortBy: this.state.sortBy,
        searchWord: this.state.searchWord,
        currentPage: this.state.currentPage,
      },
      handleSortChange: async (sortBy) => {
        const pageUrl = `/${this.state.region}?sort=${sortBy}`;
        history.pushState(
          null,
          null,
          this.state.searchWord
            ? pageUrl + `&search=${this.state.searchWord}`
            : pageUrl
        );
        const cities = await request(
          0,
          this.state.region,
          sortBy,
          this.state.searchWord
        );
        this.setState({ 
          ...this.state,
          startIndex: 0,
          sortBy: sortBy,
          cities: cities,
        });
      },
  
      handleSearch: async (searchWord) => {
        history.pushState(
          null,
          null,
          `/${this.state.region}?sort=${this.state.sortBy}&search=${searchWord}`
        );
        const cities = await request(
          0,
          this.state.region,
          this.state.sortBy,
          searchWord
        );
        this.setState({
          ...this.state,
          startIndex: 0,
          searchWord: searchWord,
          cities: cities,
        });
      },
    });
  }

  const renderRegionList = () =>{
    new RegionList({$app, initialState:this.state.region,
      handleRegion : async (region)=>{
        history.pushState(null, null, `/${region}?sort=total`)
        const cities = await request(0, region, 'total')
        this.setState({
          ...this.state,
          startIndex: 0,
          sortBy: 'total',
          region: region,
          searchWord : '',
          cities: cities,
        })
      }
    });
  }

  const renderCityList = () =>{
    new CityList({
      $app,
      initialState: this.state.cities,
      handleLoadMore: async () => {
        const newStartIndex = this.state.startIndex + 40;
        const newCities = await request(
          newStartIndex,
          this.state.region,
          this.state.sortBy,
          this.state.searchWord
        );
        this.setState({
          ...this.state,
          startIndex: newStartIndex,
          cities: {
            cities: [...this.state.cities.cities, ...newCities.cities],
            isEnd: newCities.isEnd,
          },
        });
      },
      handleItemClick: (id) =>{
        history.pushState(null,null,`/city/${id}`)
        this.setState({
          ...this.state,
          currentPage: `/city/${id}`,
        })
      }
    });
  }

  const renderCityDetail = async (cityId) => {
    try{
      const cityDetailData = await requestCityDetail(cityId);
      new CityDetail({$app, initialState: cityDetailData});
    }catch(err){
      console.log(err);
    }
    
  } 

  this.setState = (newState) => {
    this.state = newState;
    render();
  };

  const render = () =>{
    const path = this.state.currentPage;
    $app.innerHTML = '';
    if(path.startsWith('/city/')){
      const cityId = path.split('/city/')[1];
      renderHeader();
      renderCityDetail(cityId);
    }else{
      renderHeader();
      renderRegionList();
      renderCityList();
    }
  }

  window.addEventListener('popstate',async ()=>{
    const urlPath = window.location.pathname;

    const prevRegion = urlPath.replace('/','');
    const prevSortBy = getSortBy();
    const prevSearchWord = getSearchWord();
    const prevStartIdx = 0;
    const prevCities = await request (prevStartIdx, prevRegion, prevSortBy, prevSearchWord);
    
    this.setState({
      ...this.state,
      startIndex: prevStartIdx,
      sortBy: prevSortBy,
      region: prevRegion,
      searchWord: prevSearchWord,
      cities: prevCities,
      currentPage: urlPath,
    });
  });

  const init = async () => {
    const path = this.state.currentPage;

    if(path.startsWith('/city/')){
      render();
    }else{
      const cities = await request (
        this.state.startIndex, 
        this.state.region, 
        this.state.sortBy, 
        this.state.searchWord);
        this.setState({
          ...this.state,
          cities: cities,
        })
    }
  };

  init();
}
