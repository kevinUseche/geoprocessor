import { submitJob } from '@arcgis/core/rest/geoprocessor.js'

const prepareUrl = (url) => {
  const queryParams = {
    where: '1=1',
    geometryType: 'esriGeometryEnvelope',
    spatialRel: 'esriSpatialRelIntersects',
    returnGeometry: true,
    returnDistinctValues: false,
    returnIdsOnly: false,
    returnCountOnly: false,
    returnExtentOnly: false,
    returnZ: false,
    returnM: false,
    returnTrueCurves: false,
    returnExceededLimitFeatures: false,
    returnCentroid: false,
    timeReferenceUnknownClient: false,
    outFields: '*',
    f: 'geojson',
  }
  return `${url}/query?${new URLSearchParams({
    ...queryParams,
  })}`
}

const statusCallback = (jobInfo) => {
  console.log(jobInfo.jobStatus)
}

const applyGeoprocessor = async ({ url, params, output }) => {
  const options = { f: 'json' }
  const requestOptions = { timeout: 4000 }

  try {
    const jobInfo = await submitJob(url, params, options, requestOptions)
    const jobCompleted = await jobInfo.waitForJobCompletion({
      interval: 5000,
      statusCallback,
    })
    const result = await jobCompleted.fetchResultData(output)
    return result
  } catch (error) {
    console.log('Error in applyGeoprocessor: ', error)
  }
}

// const valorAmenaza =
//   'https://srvags.sgc.gov.co/arcgis/rest/services/Amenaza_Sismica/Amenaza_Sismica_Nacional/MapServer/8'
// const cuerposAgua =
//   'https://srvags.sgc.gov.co/arcgis/rest/services/Amenaza_Sismica/Amenaza_Sismica_Nacional/MapServer/5'

// applyGeoprocessor({
//   url: 'https://srvagspru.sgc.gov.co/arcgis/rest/services/Geoprocesos/union2/GPServer/union',
//   params: {
//     in_features1: prepareUrl(valorAmenaza),
//     in_features2: prepareUrl(cuerposAgua),
//     nombre: 'newLabUnion',
//   },
//   output: 'out_feature',
// }).then((result) => {
//   console.log(result)
// })

const valorAmenaza = prepareUrl(
  'https://srvags.sgc.gov.co/arcgis/rest/services/Amenaza_Sismica/Amenaza_Sismica_Nacional/MapServer/8'
)
const cuerposAgua = prepareUrl(
  'https://srvags.sgc.gov.co/arcgis/rest/services/Amenaza_Sismica/Amenaza_Sismica_Nacional/MapServer/5'
)

const url = 'https://srvagspru.sgc.gov.co'
const api = `${url}/arcgis/rest/services/Geoprocesos/union2/GPServer/union`
const sJob = `${api}/submitJob`
const getJobs = `${api}/jobs`
const queryUrl = `${sJob}?in_features1=${valorAmenaza}&in_features2=${cuerposAgua}&nombre='algo'&f=json`

fetch(queryUrl)
  .then((response) => response.json())
  .then((jobInfo) => {
    if (jobInfo.jobStatus === 'esriJobSubmitted') {
      const status = ['esriJobFailed']
      const interval = setInterval(() => {
        fetch(`${getJobs}/${jobInfo.jobId}?f=json`)
          .then((response) => response.json())
          .then((waitForJobCompletion) => {
            console.log(waitForJobCompletion)
            if (status.includes(waitForJobCompletion.jobStatus)) {
              clearInterval(interval)
            }
          })
      }, 5000)
    }
  })
