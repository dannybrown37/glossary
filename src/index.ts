const {Command} = require('commander')
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'


const termsPath = path.resolve(os.homedir(), '.terms.json');

const errorCodeForEmptyFile = 'ENOENT'
const emptyJsonString = '{}'

/*
* Reads the package.json file and returns the version as a string
*/
const getVersion = (): string => {
    const packageJson = fs.readFileSync('package.json', 'utf8')
    return JSON.parse(packageJson).version
}


/*
* Reads the CLI args and returns them as an object
*/
const getCliArgs = (version: string): Record<string, string> => {
    const program = new Command()

    program
        .version(version)
        .description('A CLI for managing a glossary of terms')
        .option('-g, --get [term]', 'Get value of an existing term')
        .option('-a, --add [term]', 'Add a new term')
        .option('-v, --value [term]', 'Optionally add a value for a new term, will prompt if not provided')
        .option('--all', 'See the full glossary of terms and values alphabetically sorted')
        .parse(process.argv)

    return program.opts()
}


/*
* Writes incoming data to a JSON file, takes a JSON string or an object
*/
const writeJsonFile = (
    jsonToWrite: string | Record<string, string>,
    termsFilePath: string = termsPath,
): void => {
    const jsonString = typeof jsonToWrite === 'string' ? jsonToWrite : JSON.stringify(jsonToWrite);
    fs.writeFileSync(termsFilePath, jsonString, 'utf8')
}


/*
* Returns a JSON string of current ~/.terms.json file, or '{}'
*/
const readOrCreateTermsFile = (termsFilePath: string = termsPath): string => {
    try {
        return fs.readFileSync(termsFilePath, 'utf8')
    } catch (err: any) {  // read terms.json or create if it does not yet exist
        if (err.code === errorCodeForEmptyFile) {
            writeJsonFile(emptyJsonString)
            return emptyJsonString
        } else {
            throw err
        }
    }
}


/*
* Prompts user to add a definition for the given term if not provided in CLI args
*/
const addTerm = async (
    term: string,
    value: string | undefined = undefined,
    termsFilePath: string = termsPath,
): Promise<void> => {
    console.log(term, value)
    const termsJson = JSON.parse(readOrCreateTermsFile(termsFilePath))
    if (value === undefined) {
        process.stdout.write(`Enter value for ${term}: `)
        process.stdin.setEncoding('utf8')
        process.stdin.on('data', (input) => {
            const inputValue = input.toString().trim()
            termsJson[term] = inputValue
            writeJsonFile(termsJson)
            console.log(termsJson)
            process.exit()
        })
    } else {
        termsJson[term] = value
        writeJsonFile(termsJson, termsFilePath)
    }

}


/*
* Gets the value of the specified term from the JSON file
*/
const getTerm = (term: string, termsFilePath: string = termsPath): string => {
    const termsJson = JSON.parse(readOrCreateTermsFile(termsFilePath))
    console.log(`${term}: ${termsJson[term]}`)
    return termsJson[term]
}

/*
* Shows all terms defined in ~/.terms.json, sorted alphabetically by key
*/
const showAllTerms = (termsFilePath: string = termsPath): Record<string, string> => {
    const termsJson = JSON.parse(readOrCreateTermsFile(termsFilePath))
    const sortedObject: Record<string, any> = {};
    Object.keys(termsJson)
        .sort()
        .forEach(key => {
            sortedObject[key] = termsJson[key];
        });
    console.log(sortedObject)
    return sortedObject
}


const main = (): void => {
    const version = getVersion()
    const options = getCliArgs(version)
    if ('all' in options) {
        showAllTerms()
    } else if ('add' in options) {
        console.log(options.add, options.value)
        addTerm(options.add, options.value)
    } else if ('get' in options) {
        getTerm(options.get)
    } else {
        console.log('For available options, please use the --help flag')
    }
}

main()


export default {
    getVersion,
    getCliArgs,
    writeJsonFile,
    readOrCreateTermsFile,
    addTerm,
    getTerm,
    showAllTerms,
}
