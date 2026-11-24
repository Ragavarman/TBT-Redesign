// Organisms — complete UI sections built from molecules and atoms.
// Organisms may import from molecules, atoms, ui/, lib/ and types/ (enforced by `npm run lint`).
// Data always comes in through props — never import from src/mocks here.

// 5a · Overlays
export * from './confirmation-modal'
export * from './dialog'

// 5b · Data
export * from './data-table'

// 5c · App navigation
export * from './app-rail'
export * from './sidebar'
export * from './sub-navigation'
export * from './workspace-header'
