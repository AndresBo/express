// Extract all printing to the console using this module.

// function for printing normal log messages
const info = (...params) => {
  console.log(...params)
}

// function for printing error messages
const error = (...params) => {
  console.error(...params)
}

module.exports = { info, error }
