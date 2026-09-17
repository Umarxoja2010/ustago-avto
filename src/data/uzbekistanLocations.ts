export interface LocationItem {
  region: string;
  city: string;
  fullName: string; // Masalan: "Toshkent shahri, Chilonzor tumani"
}

export const UZBEKISTAN_LOCATIONS: LocationItem[] = [
  // Toshkent shahri
  {
    region: "Toshkent shahri",
    city: "Chilonzor tumani",
    fullName: "Toshkent shahri, Chilonzor tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Yunusobod tumani",
    fullName: "Toshkent shahri, Yunusobod tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Mirzo Ulugʻbek tumani",
    fullName: "Toshkent shahri, Mirzo Ulugʻbek tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Mirobod tumani",
    fullName: "Toshkent shahri, Mirobod tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Yashnobod tumani",
    fullName: "Toshkent shahri, Yashnobod tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Sirgʻali tumani",
    fullName: "Toshkent shahri, Sirgʻali tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Yangihayot tumani",
    fullName: "Toshkent shahri, Yangihayot tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Olmazor tumani",
    fullName: "Toshkent shahri, Olmazor tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Uchtepa tumani",
    fullName: "Toshkent shahri, Uchtepa tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Yakkasaroy tumani",
    fullName: "Toshkent shahri, Yakkasaroy tumani",
  },
  {
    region: "Toshkent shahri",
    city: "Bektemir tumani",
    fullName: "Toshkent shahri, Bektemir tumani",
  },

  // Toshkent viloyati
  {
    region: "Toshkent viloyati",
    city: "Nurafshon shahri",
    fullName: "Toshkent viloyati, Nurafshon shahri",
  },
  {
    region: "Toshkent viloyati",
    city: "Angren shahri",
    fullName: "Toshkent viloyati, Angren shahri",
  },
  {
    region: "Toshkent viloyati",
    city: "Olmaliq shahri",
    fullName: "Toshkent viloyati, Olmaliq shahri",
  },
  {
    region: "Toshkent viloyati",
    city: "Chirchiq shahri",
    fullName: "Toshkent viloyati, Chirchiq shahri",
  },
  {
    region: "Toshkent viloyati",
    city: "Bekobod shahri",
    fullName: "Toshkent viloyati, Bekobod shahri",
  },
  {
    region: "Toshkent viloyati",
    city: "Yangiyoʻl shahri",
    fullName: "Toshkent viloyati, Yangiyoʻl shahri",
  },
  {
    region: "Toshkent viloyati",
    city: "Qibray tumani",
    fullName: "Toshkent viloyati, Qibray tumani",
  },
  {
    region: "Toshkent viloyati",
    city: "Zangiota tumani",
    fullName: "Toshkent viloyati, Zangiota tumani",
  },

  // Samarqand viloyati
  {
    region: "Samarqand viloyati",
    city: "Samarqand shahri",
    fullName: "Samarqand viloyati, Samarqand shahri",
  },
  {
    region: "Samarqand viloyati",
    city: "Kattaqoʻrgʻon shahri",
    fullName: "Samarqand viloyati, Kattaqoʻrgʻon shahri",
  },
  {
    region: "Samarqand viloyati",
    city: "Urgut tumani",
    fullName: "Samarqand viloyati, Urgut tumani",
  },
  {
    region: "Samarqand viloyati",
    city: "Jomboy tumani",
    fullName: "Samarqand viloyati, Jomboy tumani",
  },
  {
    region: "Samarqand viloyati",
    city: "Pastdargʻom tumani",
    fullName: "Samarqand viloyati, Pastdargʻom tumani",
  },

  // Farg'ona viloyati
  {
    region: "Fargʻona viloyati",
    city: "Fargʻona shahri",
    fullName: "Fargʻona viloyati, Fargʻona shahri",
  },
  {
    region: "Fargʻona viloyati",
    city: "Margʻilon shahri",
    fullName: "Fargʻona viloyati, Margʻilon shahri",
  },
  {
    region: "Fargʻona viloyati",
    city: "Qoʻqon shahri",
    fullName: "Fargʻona viloyati, Qoʻqon shahri",
  },
  {
    region: "Fargʻona viloyati",
    city: "Quvasoy shahri",
    fullName: "Fargʻona viloyati, Quvasoy shahri",
  },
  {
    region: "Fargʻona viloyati",
    city: "Rishton tumani",
    fullName: "Fargʻona viloyati, Rishton tumani",
  },

  // Andijon viloyati
  {
    region: "Andijon viloyati",
    city: "Andijon shahri",
    fullName: "Andijon viloyati, Andijon shahri",
  },
  { region: "Andijon viloyati", city: "Asaka shahri", fullName: "Andijon viloyati, Asaka shahri" },
  {
    region: "Andijon viloyati",
    city: "Xonobod shahri",
    fullName: "Andijon viloyati, Xonobod shahri",
  },
  {
    region: "Andijon viloyati",
    city: "Shahrixon shahri",
    fullName: "Andijon viloyati, Shahrixon shahri",
  },

  // Namangan viloyati
  {
    region: "Namangan viloyati",
    city: "Namangan shahri",
    fullName: "Namangan viloyati, Namangan shahri",
  },
  {
    region: "Namangan viloyati",
    city: "Chust shahri",
    fullName: "Namangan viloyati, Chust shahri",
  },
  {
    region: "Namangan viloyati",
    city: "Kosonsoy shahri",
    fullName: "Namangan viloyati, Kosonsoy shahri",
  },

  // Buxoro viloyati
  { region: "Buxoro viloyati", city: "Buxoro shahri", fullName: "Buxoro viloyati, Buxoro shahri" },
  { region: "Buxoro viloyati", city: "Kogon shahri", fullName: "Buxoro viloyati, Kogon shahri" },
  {
    region: "Buxoro viloyati",
    city: "Gʻijduvon shahri",
    fullName: "Buxoro viloyati, Gʻijduvon shahri",
  },

  // Sirdaryo viloyati
  {
    region: "Sirdaryo viloyati",
    city: "Guliston shahri",
    fullName: "Sirdaryo viloyati, Guliston shahri",
  },
  {
    region: "Sirdaryo viloyati",
    city: "Yangiyer shahri",
    fullName: "Sirdaryo viloyati, Yangiyer shahri",
  },
  {
    region: "Sirdaryo viloyati",
    city: "Shirin shahri",
    fullName: "Sirdaryo viloyati, Shirin shahri",
  },
  {
    region: "Sirdaryo viloyati",
    city: "Boyovut tumani",
    fullName: "Sirdaryo viloyati, Boyovut tumani",
  },

  // Jizzax viloyati
  { region: "Jizzax viloyati", city: "Jizzax shahri", fullName: "Jizzax viloyati, Jizzax shahri" },
  { region: "Jizzax viloyati", city: "Zomin tumani", fullName: "Jizzax viloyati, Zomin tumani" },
  {
    region: "Jizzax viloyati",
    city: "Gʻallaorol tumani",
    fullName: "Jizzax viloyati, Gʻallaorol tumani",
  },

  // Qashqadaryo viloyati
  {
    region: "Qashqadaryo viloyati",
    city: "Qarshi shahri",
    fullName: "Qashqadaryo viloyati, Qarshi shahri",
  },
  {
    region: "Qashqadaryo viloyati",
    city: "Shahrisabz shahri",
    fullName: "Qashqadaryo viloyati, Shahrisabz shahri",
  },
  {
    region: "Qashqadaryo viloyati",
    city: "Kitob tumani",
    fullName: "Qashqadaryo viloyati, Kitob tumani",
  },

  // Surxondaryo viloyati
  {
    region: "Surxondaryo viloyati",
    city: "Termiz shahri",
    fullName: "Surxondaryo viloyati, Termiz shahri",
  },
  {
    region: "Surxondaryo viloyati",
    city: "Denov shahri",
    fullName: "Surxondaryo viloyati, Denov shahri",
  },

  // Navoiy viloyati
  { region: "Navoiy viloyati", city: "Navoiy shahri", fullName: "Navoiy viloyati, Navoiy shahri" },
  {
    region: "Navoiy viloyati",
    city: "Zarafshon shahri",
    fullName: "Navoiy viloyati, Zarafshon shahri",
  },

  // Xorazm viloyati
  {
    region: "Xorazm viloyati",
    city: "Urganch shahri",
    fullName: "Xorazm viloyati, Urganch shahri",
  },
  { region: "Xorazm viloyati", city: "Xiva shahri", fullName: "Xorazm viloyati, Xiva shahri" },

  // Qoraqalpogʻiston Respublikasi
  {
    region: "Qoraqalpogʻiston Respublikasi",
    city: "Nukus shahri",
    fullName: "Qoraqalpogʻiston Respublikasi, Nukus shahri",
  },
  {
    region: "Qoraqalpogʻiston Respublikasi",
    city: "Xoʻjayli tumani",
    fullName: "Qoraqalpogʻiston Respublikasi, Xoʻjayli tumani",
  },
];
