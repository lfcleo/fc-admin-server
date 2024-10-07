export default {
    //正则校验手机号码正确性
    isValidPhoneNumber(phoneNumber: string): boolean {
        // 匹配以1开头，第二位是3、4、5、7、8、9中的一个，后面跟着9位任意数字的手机号码  
        const phonePattern = /^1[3456789]\d{9}$/;
        return phonePattern.test(phoneNumber);
    },
    //正则校验密码(要求至少包含一个小写字母，一个大写字母，一个数字,长度至少为6)
    isValidPassword(password: string): boolean {
        const phonePattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        return phonePattern.test(password);
    },
    //正则校验邮箱
    isValidEmail(email: string): boolean {
        const phonePattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return phonePattern.test(email);
    },
}