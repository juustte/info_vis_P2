const fs = require('fs')
const parse = require('csv-parse/lib/sync')

const worldJSON = require('./world-110m.json').objects.ne_110m_admin_0_countries.geometries
const countryData = worldJSON.map(({properties}) => ({
  name: properties.NAME,
  longName: properties.NAME_LONG,
  formalName: properties.FORMAL_EN,
  code: properties.ISO_A3,
  continent: properties.CONTINENT
}))

// Functions for Data Manipulation
const parseValue = value => {
  const [ whole, remainder ] = value.split(',')
  if(whole === '') {
    return undefined
  }
  if(remainder === undefined) {
    return Number(whole)
  }
  return Number(`${whole}.${remainder}`)
}

const getCountryData = name => {

  const foundCountry = countryData.find(country => {
    return(
      country.name.includes(name) ||
      country.longName.includes(name) ||
      country.formalName.includes(name)
    )
  })

  if(foundCountry === undefined) {
    return undefined
  }
  else {
    if(name.includes('Cyprus')) {
      return {
        name: name,
        code: 'CYP',
        continent: foundCountry.continent
      }
    }
    return {
      name: foundCountry.name,
      code: foundCountry.code,
      continent: foundCountry.continent
    }
  }

}

const completeData = country => {
  console.log(country)
  const { name, code } = getCountryData(country['Country'])

  return ({
    name,
    code,
    '1981-1984': parseValue(country['1981-1984']),
    '1990-1994': parseValue(country['1990-1994']),
    '1995-1999': parseValue(country['1995-1999']),
    '2000-2004': parseValue(country['2000-2004']),
    '2005-2009': parseValue(country['2005-2009']),
    '2010-2014': parseValue(country['2010-2014'])
  })
}

const countriesForTimeperiod = (data, time) => {
  return data.reduce((acc, curr) => {
    if(curr[time] !== undefined) {
      acc.push({
        code: curr.code,
        value: curr[time]
      })
    }
    return acc
  }, [])
}

const createCountries = (data) => {
  return ({
    '1981-1984': countriesForTimeperiod(data, '1981-1984'),
    '1990-1994': countriesForTimeperiod(data, '1990-1994'),
    '1995-1999': countriesForTimeperiod(data, '1995-1999'),
    '2000-2004': countriesForTimeperiod(data, '2000-2004'),
    '2005-2009': countriesForTimeperiod(data, '2005-2009'),
    '2010-2014': countriesForTimeperiod(data, '2010-2014'),
  })
}

const createJSONForWave = (countries) => {
  return countries.reduce((acc, curr) => {
    acc[curr.code] = curr.value
    return acc
  }, {})
}

const createJSON = (countries) => {
  return ({
    '1981-1984': createJSONForWave(countries['1981-1984']),
    '1990-1994': createJSONForWave(countries['1990-1994']),
    '1995-1999': createJSONForWave(countries['1995-1999']),
    '2000-2004': createJSONForWave(countries['2000-2004']),
    '2005-2009': createJSONForWave(countries['2005-2009']),
    '2010-2014': createJSONForWave(countries['2010-2014']),
  })
}

// Load all files for the CSVs
const inputLabour = fs.readFileSync('./labour_unions.csv')
const inputPress = fs.readFileSync('./press.csv')
const inputPolice = fs.readFileSync('./police.csv')
const inputParliament = fs.readFileSync('./parliament.csv')
const inputChurches = fs.readFileSync('./churches.csv')
const inputArmedForces = fs.readFileSync('./armed_forces.csv')
const inputCompanies = fs.readFileSync('./major_companies.csv')
const inputJustice = fs.readFileSync('./justice_system.csv')

// Interpret the CSV files and transform into JS objects
const dataLabour = parse(inputLabour, { columns: true, delimiter: ',' })
const dataPress = parse(inputPress, { columns: true, delimiter: ',' })
const dataPolice = parse(inputPolice, { columns: true, delimiter: ',' })
const dataParliament = parse(inputParliament, { columns: true, delimiter: ',' })
const dataChurches = parse(inputChurches, { columns: true, delimiter: ',' })
const dataArmedForces = parse(inputArmedForces, { columns: true, delimiter: ',' })
const dataCompanies = parse(inputCompanies, { columns: true, delimiter: ',' })
const dataJustice = parse(inputJustice, { columns: true, delimiter: ',' })

// Create the final JSON with the Data Manipulation functions above
const labourJSON = ({
  'Labour_Unions': createJSON(createCountries(dataLabour.map(completeData))),
})
const pressJSON = ({
  'Press': createJSON(createCountries(dataPress.map(completeData))),
})
const policeJSON = ({
  'Police': createJSON(createCountries(dataPolice.map(completeData))),
})
const parliamentJSON = ({
  'Parliament': createJSON(createCountries(dataParliament.map(completeData))),
})
const churchesJSON = ({
  'Churches': createJSON(createCountries(dataChurches.map(completeData))),
})
const armedForcesJSON = ({
  'Armed_Forces': createJSON(createCountries(dataArmedForces.map(completeData))),
})
const companiesJSON = ({
  'Major_Companies': createJSON(createCountries(dataCompanies.map(completeData))),
})
const justiceJSON = ({
  'Justice_System': createJSON(createCountries(dataJustice.map(completeData))),
})

// Write the JSON files onto the hard drive aka. Creating the JSON files
fs.writeFileSync('./labour_unions.json', JSON.stringify(labourJSON, null, 2) , 'utf-8')
fs.writeFileSync('./press.json', JSON.stringify(pressJSON, null, 2) , 'utf-8')
fs.writeFileSync('./police.json', JSON.stringify(policeJSON, null, 2) , 'utf-8')
fs.writeFileSync('./parliament.json', JSON.stringify(parliamentJSON, null, 2) , 'utf-8')
fs.writeFileSync('./churches.json', JSON.stringify(churchesJSON, null, 2) , 'utf-8')
fs.writeFileSync('./armed_forces.json', JSON.stringify(armedForcesJSON, null, 2) , 'utf-8')
fs.writeFileSync('./major_companies.json', JSON.stringify(companiesJSON, null, 2) , 'utf-8')
fs.writeFileSync('./justice_system.json', JSON.stringify(justiceJSON, null, 2) , 'utf-8')
