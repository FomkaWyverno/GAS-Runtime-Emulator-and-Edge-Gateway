export interface URLFetchRequestOptions {
    /** Тип контенту запиту (за замовчуванням 'application/x-www-form-urlencoded') */
    contentType?: string;

    /** Мапа заголовків HTTP для запиту */
    headers?: Record<string, string>;

    /** Метод HTTP: get, delete, patch, post або put. За замовчуванням get */
    method?: 'get' | 'delete' | 'patch' | 'post' | 'put';

    /** 
     * Тіло запиту (POST body). 
     * Може бути рядком, масивом байтів, Blob або об'єктом (для form-data).
     */
    payload?: string | number[] | Int8Array | Blob | Record<string, any>;

    /** @deprecated Використовувався для SDC */
    useIntranet?: boolean;

    /** Якщо false, ігноруються невалідні сертифікати HTTPS. За замовчуванням true */
    validateHttpsCertificates?: boolean;

    /** Якщо false, автоматичний редирект вимкнено. За замовчуванням true */
    followRedirects?: boolean;

    /** Якщо true, при помилках (4xx, 5xx) виключення не викидається. За замовчуванням false */
    muteHttpExceptions?: boolean;

    /** Якщо false, зарезервовані символи в URL не екрануються. За замовчуванням true */
    escaping?: boolean;
}