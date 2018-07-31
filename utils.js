function safeParse (payload) {
  try {
    return JSON.parse(payload)
  } catch (error) {
    return null
  }
}

function quotifyArg (arg) {
  return arg.includes(' ') ? `"${arg}"` : arg
}

module.exports = {
  safeParse,
  quotifyArg
}
