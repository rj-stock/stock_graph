export function getKData(code, period = "day") {
  return fetch(`../kdata/${code}/${period}`).then((res) => res.json())
}
