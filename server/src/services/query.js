const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 0
function getPagination(query) {
  const page = Math.abs(query.page) || DEFAULT_PAGE
  const limit = Math.abs(query.pageSize) || DEFAULT_PAGE_SIZE
  const skip = limit * (page - 1)
  return {
    skip,
    limit
  }
}

module.exports = {
  getPagination,
}
