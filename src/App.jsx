import React, { useState, useEffect } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import './App.css';

const client = new ApolloClient({
  uri: 'https://countries.trevorblades.com/graphql',
  cache: new InMemoryCache(),
});

const GET_COUNTRIES = gql`
  query GetCountries {
    countries {
      code
      name
      currency
      languages {
        code
        name
      }
    }
  }
`;

const predefinedColors = ['lightblue', 'lightgreen', 'lightcoral', 'lightpink'];

function App() {
  const [filterText, setFilterText] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [groupSize, setGroupSize] = useState();

  const { loading, error, data } = useQuery(GET_COUNTRIES);

  useEffect(() => {
    if (data && data.countries) {
      setCountries(data.countries);
    }
  }, [data]);

  const handleFilterChange = (e) => {
    setFilterText(e.target.value);
  };

  const handleItemClick = (country) => {
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(country)) {
        return prevSelectedItems.filter((item) => item !== country);
      } else {
        return [...prevSelectedItems, country];
      }
    });
    setSelectedColorIndex((prevIndex) => (prevIndex + 1) % predefinedColors.length);
  };

  const handleGroupSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setGroupSize(newSize);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const shouldRenderCountries = filterText.trim() === '' ? [] : filteredCountries;

  const groupedSelectedItems = selectedItems.reduce((groups, item, index) => {
    const groupIndex = Math.floor(index / groupSize);
    if (!groups[groupIndex]) {
      groups[groupIndex] = [];
    }
    groups[groupIndex].push(item);
    return groups;
  }, []);

  return (
    <div>
      <input className='filter'
        type="text"
        placeholder="Filter by name..."
        value={filterText}
        onChange={handleFilterChange}
      />
      <input className='filter'
        type="number"
        placeholder="Group Size"
        value={groupSize}
        onChange={handleGroupSizeChange}
      />
      <div>
        <h2 className='text'>Selected Items</h2>
        {groupedSelectedItems.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h3>Group {groupIndex + 1}</h3>
            <ul>
              {group.map((item) => (
                <li key={item.code}>{item.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div>
        <h2 className='text'>Filtered Countries</h2>
        {shouldRenderCountries.map((country) => (
          <li 
            key={country.code}
            style={{
              backgroundColor:
                selectedItems.includes(country)
                  ? predefinedColors[selectedColorIndex]
                  : 'transparent',
            }}
            onClick={() => handleItemClick(country)}
          >
            {country.name}
          </li>
        ))}
      </div>
    </div>
  );
}

function MainApp() {
  return (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
}

export default MainApp;
