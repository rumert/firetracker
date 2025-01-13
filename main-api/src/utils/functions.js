async function fetchCategoryFromAI(aiModel, expenseTitle) {
    return 'category'; //remove this later!
    const listOfCategories = 'Groceries, Utilities, Transportation, Entertainment, Dining, Healthcare, Clothing, Education, Travel, Hobbies'
    const prompt = `Categorize the following expense title into one of these categories: ${listOfCategories}.\n\nTitle: ${expenseTitle}.\n\nDon't give me a response other than the category. If it fits more than one category, pick whatever you want.`
    const result = await aiModel.generateContent(prompt);
    return result.response.text().trim();
}

async function getDataWithCaching(redisClient, cacheKey, cb, expiration = 3600) {
    const data = await redisClient.get(cacheKey)
    if (data != null) {
        return JSON.parse(data)
    }
    const freshData = await cb()
    await redisClient.setEx(cacheKey, expiration, JSON.stringify(freshData))
    return freshData
}

const throwError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    throw error;
};

const randomDate = () => {
    const start = new Date(2020, 0, 1);
    const end = new Date(); 
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

module.exports = {
    fetchCategoryFromAI,
    getDataWithCaching,
    throwError,
    randomDate,
}