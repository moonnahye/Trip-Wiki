import Header from "./components/Header.js";
import RegionList from "./components/RegionList.js";
import CityList from "./components/CityList.js";
import CityDetail from "./components/CityDetail.js";

import { request } from "./components/api.js";

export default function App($app) {
  this.state = {
    startIndex: 0,
    sortBy: "",
    searchWord: "",
    region: "",
    cities: "",
  };

  const header = new Header();
  const regionList = new RegionList();
  const cityList = new CityList({
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
  });
  const cityDetail = new CityDetail();

  this.setState = (newState) => {
    this.state = newState;
    cityList.setState(this.state.cities);
  };

  const init = async () => {
    const cities = await request(
      this.state.startIndex,
      this.state.region,
      this.state.sortBy,
      this.state.searchWord
    );
    this.setState({
      ...this.state,
      cities: cities,
    });
  };

  init();
}
