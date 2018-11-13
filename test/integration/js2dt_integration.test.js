'use strict'
/* global describe, it */

/**
 * Integration testing module (js2dt).
 * Runs js2dt script for each file from EXAMPLES_FOLDER and
 * performs validation of output RAML.
 *
 * Errors are output to console in a form:
 *  FAIL (type of fail):
 *  - Error message [optional line.column range]
 *
 * If test passes it will just log 'OK'.
 *
 * Tests are launched by running this file with nodejs.
 */

const path = require('path')
const parser = require('raml-1-parser')
const helpers = require('./helpers')
const fs = require('fs');
const { expect, assert } = require('chai');

const js2dt = require('../../src/js2dt')
const cli = require('../../src/js2dt_cli')

const EXAMPLES_FOLDER = path.join(__dirname, 'json')

/**
 * Log RAML validation error.
 * @param {Error} error
 */
function getValidationError (error) {
  if (!error.parserErrors) {
    return [error.message];
  }
  return error.parserErrors.map(function (el) {
    return '- ' + el.message + ' [' +
      el.range.start.line + '.' + el.range.start.column + ':' +
      el.range.end.line + '.' + el.range.end.column + ']'
  })
}

function log(errors) {
  console.log('FAIL (RAML validation):');
  errors.forEach(errMessage => console.log(errMessage))
}

describe('js2dt integration test', () => {
  helpers.forEachFileIn(EXAMPLES_FOLDER, (filepath) => {
    if (!(filepath.endsWith('.json'))) return;
    
    /**
     * Test file by running js2dt script on it and then validating
     * with raml-1-parser.
     */
    if (filepath.endsWith('.fail.json')) it(`should fail ${filepath}`, () => {
      const typeName = 'TestType'
      js2dt.setBasePath(EXAMPLES_FOLDER)
      
      let thrown;
      
      try {
        const raml = cli(filepath, typeName)
        parser.parseRAMLSync(raml, { 'rejectOnErrors': true })
      } catch (error) {
        thrown = error;
      }

      assert(thrown !== undefined, 'should have thrown');

      const snapshotPath = path.join(filepath.replace('.fail.json', '.fail.snap'));
      const snapshotText = getValidationError(thrown).join('\n');
      if (fs.existsSync(snapshotPath)) {
          assert(fs.readFileSync(snapshotPath, { encoding: 'utf8' }) === snapshotText);
      } else {
        fs.writeFile(snapshotPath, snapshotText, { encoding: 'utf8' }, () => {});
      }
    }) 
    else it(`should convert ${filepath}`, () => {
      const typeName = 'TestType'
      js2dt.setBasePath(EXAMPLES_FOLDER)
      const raml = cli(filepath, typeName)

      try {
        parser.parseRAMLSync(raml, { 'rejectOnErrors': true })
      } catch (error) {
        log(getValidationError(error));
        throw error
      }
    })
  })
})
