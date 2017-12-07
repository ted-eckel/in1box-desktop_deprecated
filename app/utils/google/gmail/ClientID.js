/** @flow */
let counter = 0

export default function getClientID(): string {
  counter += 1
  return `ClientID-${counter}`
}
