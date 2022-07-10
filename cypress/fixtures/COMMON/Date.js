import dayjs from 'dayjs'
import dayjsBusinessDays from 'dayjs-business-days'

dayjs.extend(dayjsBusinessDays)

class Date {

    /**
     * Возвращает дату с разницей от текущей даты согласно substractValue и subjectToSubtract
     * @param {String} format Например YYYY-MM-DD или DD.MM.YYYY
     * @param {Number} substractValue Сколько нужно отнять от текущей даты
     * @param {String} subjectToSubtract Что year или day нужно отнять от текущей даты
     */
    getSubstractDate(format, substractValue, subjectToSubtract) {
        return dayjs().subtract(substractValue, subjectToSubtract).format(format)
    }

    /**
     * Возвращает дату с разницей от текущей даты в указанное количество рабочих дней
     * @param {String} format Например YYYY-MM-DD или DD.MM.YYYY
     * @param {Number} days Сколько нужно отнять от текущей даты
     */
    getbusinessDaysSubtractDate(format, days) {
        return dayjs().businessDaysSubtract(days).format(format)
    }

    getDatetoDateFormat(dateForChange) {
        const dateToUTC = dayjs(dateForChange).subtract(6, 'hour')
        return dayjs(dateToUTC).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    }

}
export default Date