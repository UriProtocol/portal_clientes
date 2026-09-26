export default function calculateMeasures(measure: string): string[] {
    if (!measure) return []
    const includesDecimal = measure.includes(".")
    const isAlreadyFormatted = /[\/RXTLW()-]|\..*\./.test(measure);

    if (isAlreadyFormatted) return []

    let decimalIsInFirstDigit = false
    let combinations: any[] = []
    let measures = [measure]

    switch (measure.length) {
        case 8:

            if (!includesDecimal) {
                const first = measure.substring(0, 4)
                const second = measure.substring(4, 8)
                return [
                    `${first}/${second}`,
                    `${first}-${second}`,
                    `${first}-${second.substring(0, 2)}/${second.substring(2, 4)}`,
                    `${first}-${second.substring(0, 2)}-${second.substring(2, 4)}`,
                    measure
                ]
            }

            decimalIsInFirstDigit = measure.split('.')[0].length <= 2
            combinations = ['-', 'R']
            measures = [measure]

            if (decimalIsInFirstDigit) {
                const firstDigit = measure.split('.')[0]
                if (measure.length === (firstDigit.length + 1)) return []

                if (firstDigit.length === 1) {
                    const trueFirstDigit = measure.substring(0, (firstDigit.length + 2))
                    const potentialSecondDigitOne = measure.substring(3, 5)
                    const potentialSecondDigitTwo = measure.substring(3, 6)
                    const potentialThirdDigitOne = measure.substring(5, 8)
                    const potentialThirdDigitTwo = measure.substring(6, 8)

                    combinations = [
                        ['-', 'R'],
                        ['-', 'TR'],
                        ['-', 'TR-'],
                        ['-', 'TT'],
                        ['-', 'PL'],
                        ['-', '-'],
                        ['/', 'R'],
                        ['/', 'TR'],
                        ['/', '-'],
                    ]
                    combinations.forEach(combination => {
                        measures.push(
                            `${trueFirstDigit}${combination[0]}${potentialSecondDigitOne}${combination[1]}${potentialThirdDigitOne}`,
                            `${trueFirstDigit}${combination[0]}${potentialSecondDigitTwo}${combination[1]}${potentialThirdDigitTwo}`,
                            `${measure.substring(0, 4)}${combination[0]}${measure.substring(4, 6)}${combination[1]}${measure.substring(6, 8)}`,
                            `${measure.substring(0, 4)}${combination[0]}${measure.substring(4, 5)}${combination[1]}${measure.substring(5, 8)}`,
                        )
                    })
                    measures.push(`${measure.substring(0, 4)}-${measure.substring(4, 8)}`)
                    return measures

                }

                const trueFirstDigit = measure.substring(0, (firstDigit.length + 2))
                const secondDigit = measure.substring(trueFirstDigit.length, trueFirstDigit.length + 2)
                const thirdDigit = measure.substring(secondDigit.length + trueFirstDigit.length, measure.length)

                combinations = [
                    ['/', '-'],
                    ['/', 'R'],
                    ['-', '-'],
                    ['-', 'R'],
                ]

                combinations.forEach(combination => {
                    measures.push(
                        `${trueFirstDigit}${combination[0]}${secondDigit}${combination[1]}${thirdDigit}`,
                        `${trueFirstDigit}0${combination[0]}${secondDigit}${combination[1]}${thirdDigit}`
                    )
                })

                measures.push(
                    `${measure.substring(0, 4)}-${measure.substring(4, measure.length)}`
                )

                return measures

            } else {
                const firstDigit = measure.substring(0, 2)
                const secondDigit = measure.substring(2, 6)
                const thirdDigit = measure.substring(6, measure.length)

                combinations = [
                    ['/', '-'],
                    ['/', 'R'],
                    ['-', '-'],
                    ['-', 'R'],
                    ['-', '-'],
                    ['X', 'R']
                ]

                combinations.forEach(combination => {
                    measures.push(
                        `${firstDigit}${combination[0]}${secondDigit}${combination[1]}${thirdDigit}`,
                        `${firstDigit}${combination[0]}${secondDigit}0${combination[1]}${thirdDigit}`,
                    )
                })

                return measures

            }

            break;
        case 7:

            if (!includesDecimal) {
                const first = measure.substring(0, 3)
                const second = measure.substring(3, 5)
                const third = measure.substring(5, 7)
                return [
                    `${first}/${second}R${third}`,
                    `${first}/${second}TR${third}`,
                    `${first}/${second}ZR${third}`,
                    `${first}/${second}-${third}`,
                    `${first}/${second}${third.substring(0, 1)}-${third.substring(1, 2)}`,
                    `${first}-${second}R${third}`,
                    `${first}-${second}TR${third}`,
                    `${first}-${second}-${third}`,
                    `${first}X${second}R${third}`,
                    `${first}X${second}-${third}`,
                    `${first}X${second}${third.substring(0, 1)}`,
                    measure
                ]
            }

            decimalIsInFirstDigit = measure.split('.')[0].length <= 2

            combinations = ['R', '-', 'L']
            measures = [measure]

            if (decimalIsInFirstDigit) {

                const firstDigit = measure.split('.')[0]

                if (measure.length === (firstDigit.length + 1)) return []

                const trueFirstDigit = measure.substring(0, (firstDigit.length + 2))
                const potentialFirstDigit = `${trueFirstDigit}0`

                const potentialSecondDigit = measure.substring(trueFirstDigit.length, measure.length)
                const potentialSecondDigitTwo = measure.substring(potentialFirstDigit.length, measure.length)

                combinations.forEach(combination => {
                    measures.push(
                        `${trueFirstDigit}${combination}${potentialSecondDigit}`,
                        `${potentialFirstDigit}${combination}${potentialSecondDigit}`,
                        `${trueFirstDigit}${combination}${potentialSecondDigitTwo}`,
                        `${potentialFirstDigit}${combination}${potentialSecondDigitTwo}`,
                    )
                })
                return measures

            } else {

                const potentialFirstDigitOne = measure.substring(0, 2)
                const potentialFirstDigitTwo = measure.substring(0, 3)
                const potentialSecondDigitOne = measure.substring(2, measure.length)
                const potentialSecondDigitTwo = measure.substring(3, measure.length)

                combinations.push('X')

                combinations.forEach(combination => {
                    measures.push(
                        `${potentialFirstDigitOne}${combination}${potentialSecondDigitOne}`,
                        `${potentialFirstDigitTwo}${combination}${potentialSecondDigitTwo}`,
                    )
                })

                const decimalIsInLastDigit = measure.split('.')[1].length == 1

                if (decimalIsInLastDigit) {
                    measures.push(
                        `${measure.substring(0, 2)}X${measure.substring(2, 4)}on${measure.substring(4, measure.length)}`
                    )
                }

                return measures

            }

            break;
        case 6:

            if (!includesDecimal) {
                const first = measure.substring(0, 2)
                const second = measure.substring(2, 4)
                const third = measure.substring(4, 6)
                return [
                    `${first}X${second}R${third}`,
                    `${first}X${second}-${third}`,
                    `${first}/${second}R${third}`,
                    `${first}/${second}TR${third}`,
                    `${first}/${second}-${third}`,
                    `${first}-${second}-${third}`,
                    `${first}-${second}R${third}`,
                    `${first}${second}/${third}`,
                    `${first}${second}R${third}`,
                    `${first}${second}-${third}`,
                    measure,

                ]
            }

            decimalIsInFirstDigit = measure.split('.')[0].length <= 3

            combinations = ['R', '-', 'L', 'L-']
            measures = [measure]

            if (decimalIsInFirstDigit) {
                const firstDigit = measure.split('.')[0]

                if (measure.length === (firstDigit.length + 1)) return []

                const trueFirstDigit = measure.substring(0, (firstDigit.length + 2))
                const potentialFirstDigit = `${trueFirstDigit}0`

                const potentialSecondDigit = measure.substring(trueFirstDigit.length, measure.length)
                const potentialSecondDigitTwo = measure.substring(potentialFirstDigit.length, measure.length)

                combinations.forEach(combination => {
                    measures.push(
                        `${trueFirstDigit}${combination}${potentialSecondDigit}`,
                        `${potentialFirstDigit}${combination}${potentialSecondDigit}`,
                        `${trueFirstDigit}${combination}${potentialSecondDigitTwo}`,
                        `${potentialFirstDigit}${combination}${potentialSecondDigitTwo}`,
                    )
                })
                return measures

            } else {

                const potentialFirstDigitOne = measure.substring(0, 1)
                const potentialFirstDigitTwo = measure.substring(0, 2)
                const potentialFirstDigitThree = measure.substring(0, 3)
                const potentialSecondDigitOne = measure.substring(1, measure.length)
                const potentialSecondDigitTwo = measure.substring(2, measure.length)
                const potentialSecondDigitThree = measure.substring(3, measure.length)

                combinations.push('X')

                combinations.forEach(combination => {
                    measures.push(
                        `${potentialFirstDigitOne}${combination}${potentialSecondDigitOne}`,
                        `${potentialFirstDigitTwo}${combination}${potentialSecondDigitTwo}`,
                        `${potentialFirstDigitThree}${combination}${potentialSecondDigitThree}`,
                    )
                })
                return measures
            }



            break;
        case 5:

            if (!includesDecimal) {
                const first = measure.substring(0, 3)
                const second = measure.substring(3, 5)
                return [
                    `${first}R${second}`,
                    `${first}/${second}`,
                    `${first}-${second}`,
                    `${first.substring(0, 2)}X${first.substring(2, 3)}-${second}`,
                    measure,

                ]
            }

            decimalIsInFirstDigit = measure.split('.')[0].length <= 2

            combinations = ['R', '-', 'L', 'L-']
            measures = [measure]

            if (decimalIsInFirstDigit) {
                const firstDigit = measure.split('.')[0]

                if (measure.length === (firstDigit.length + 1)) return []

                const trueFirstDigit = measure.substring(0, (firstDigit.length + 2))
                const potentialFirstDigit = `${trueFirstDigit}0`

                const potentialSecondDigit = measure.substring(trueFirstDigit.length, measure.length)
                const potentialSecondDigitTwo = measure.substring(potentialFirstDigit.length, measure.length)

                combinations.forEach(combination => {
                    measures.push(
                        `${trueFirstDigit}${combination}${potentialSecondDigit}`,
                        `${potentialFirstDigit}${combination}${potentialSecondDigit}`,
                        `${trueFirstDigit}${combination}${potentialSecondDigitTwo}`,
                        `${potentialFirstDigit}${combination}${potentialSecondDigitTwo}`,
                    )
                })
                return measures

            } else {

                const potentialFirstDigitOne = measure.substring(0, 1)
                const potentialFirstDigitTwo = measure.substring(0, 2)
                const potentialSecondDigitOne = measure.substring(1, measure.length)
                const potentialSecondDigitTwo = measure.substring(2, measure.length)

                combinations.forEach(combination => {
                    measures.push(
                        `${potentialFirstDigitOne}${combination}${potentialSecondDigitOne}`,
                        `${potentialFirstDigitTwo}${combination}${potentialSecondDigitTwo}`,
                    )
                })
                return measures
            }

            break;
        case 4:

            if (!includesDecimal) {
                const first = measure.substring(0, 2)
                const second = measure.substring(2, 4)
                return [
                    `${first}R${second}`,
                    `${first}TR${second}`,
                    `${first}-${second}`,
                    `${first}/${second}`,
                    measure,

                ]
            } else {
                return []
            }

            break;
        case 3:

            if (!includesDecimal) {
                return [
                    `R${measure}`,
                    `${measure.substring(0, 2)}X${measure.substring(2, 3)}`,
                    measure,

                ]
            } else {
                return []
            }

            break;

        default:
            return []
            break;
    }

}