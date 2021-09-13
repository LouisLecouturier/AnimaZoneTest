"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let data = [];
    let amount = 100;
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    let date = new Date();
    while (amount--) {
      data.push({
        name: "Patrick",
        gender: "female",
        price: "100",
        category: "dog",
        birth_date: date,
        city: "lille",
        image1: "https://source.unsplash.com/random",
        image2: "https://source.unsplash.com/random",
        image3: "https://source.unsplash.com/random",
        description: "Prout prout prout",
        about1: "Je",
        about2: "suis",
        about3: "beau",
        sterilized: true,
        identified: true,
        dewormed: true,
        rage_vaccinated: true,
        // Chats
        typhus_vaccinated: true,
        coryza_vaccinated: true,
        felv_vaccinated: true,
        felv_test: true,
        fiv_test: true,
        // Lapin
        myxomatosis_vaccinated: true,
        rh_vaccinated: true,
        // Chiens
        square_disease_vaccinated: true,
        parvovirosis_vaccinated: true,
        hepatitis_vaccinated: true,
        leptospirosis_vaccinated: true,
        association_id: 1,
        createdAt: date,
        updatedAt: date,
      });
    }
    await queryInterface.bulkInsert("Listings", data, {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Listings", null, {});
  },
};
