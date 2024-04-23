import fs from 'fs'
import indexModule from '../src/index'


describe('Getting the version', () => {
    test('returns the version from package.json', () => {
        const semanticVersionRegex = /^\d+\.\d+\.\d+$/
        expect(indexModule.getVersion()).toMatch(semanticVersionRegex)
    })
})


describe('CLI arguments parsing', () => {
    test('parses command-line arguments correctly', () => {
        const testCases = [
            ['node', 'script.js', '--add', 'term', '--value', 'value'],
            ['node', 'script.js', '--all'],
            ['node', 'script.js', '--get', 'term'],
        ]
        const expectedResults = [
            {add: 'term', value: 'value'},
            {all: true},
            {get: 'term'},
        ]
        for (let i = 0; i < testCases.length; i++) {
            process.argv = testCases[i]
            const options = indexModule.getCliArgs('1.0.0')
            expect(options).toEqual(expectedResults[i])
        }
    })
})


describe('Reading/writing JSON file functionality testing', () => {
    const testPath = './.test.json'
    const testPath2 = './.test2.json'

    test('tests that reading/writing JSON files works as expected', () => {

        const stringJson = '{"what": "is it"}'
        indexModule.writeJsonFile(stringJson, testPath)
        const fileContents = indexModule.readOrCreateTermsFile(testPath)
        expect(fileContents).toEqual(stringJson)

        const fileContents2 = indexModule.readOrCreateTermsFile(testPath2)
        expect(fileContents2).toEqual('{}')

        const jsonObject = {its: 'it'}
        indexModule.writeJsonFile(jsonObject, testPath2)
        const fileContents3 = indexModule.readOrCreateTermsFile(testPath2)
        expect(fileContents3).toEqual(JSON.stringify(jsonObject))
    })

    afterAll(() => {
        [testPath, testPath2].forEach((path) => {
            if (fs.existsSync(path)) {
                fs.unlinkSync(path)
            }
        })
    })
})


describe('Get/add/all terms functionality testing', () => {

    const testFilePath = './.testcrud.json'

    beforeAll(() => {
        const testGlossary = {
            perfect: "yes, it's true",
        }
        indexModule.writeJsonFile(testGlossary, testFilePath)
    })

    test('Test basic getting/adding for glossary of terms', () => {
        const result = indexModule.getTerm('perfect', testFilePath)
        expect(result).toEqual('yes, it\'s true')

        const result2 = indexModule.getTerm('without', testFilePath)
        expect(result2).toEqual(undefined)

        indexModule.addTerm('without', 'me you\'re only you', testFilePath)
        const result3 = indexModule.getTerm('without', testFilePath)
        expect(result3).toEqual('me you\'re only you')

        const result4 = indexModule.showAllTerms(testFilePath)
        expect(result4).toEqual(
            {
                perfect: "yes, it's true",
                without: "me you're only you",
            }
        )

    })

    afterAll(() => {
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath)
        }
    })
})
