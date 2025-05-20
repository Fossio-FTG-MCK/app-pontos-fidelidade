// Store detailed information about each partner
const partnersData = [
    {
        id: 1,
        name: "Restaurante Praia Azul",
        logo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        banner: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        description: "O melhor da culinária praiana com vista para o mar de Cabo Frio. Oferecemos pratos da gastronomia local com ingredientes frescos e atendimento personalizado.",
        phone: "(22) 99876-5432",
        email: "contato@praiaazul.com.br",
        address: "Av. Litorânea, 123 - Praia do Forte, Cabo Frio - RJ",
        website: "www.restaurantepraiaazul.com.br",
        social: {
            instagram: "praiaazul_oficial",
            facebook: "restaurantepraiaazul",
            twitter: "praiaazulcabo"
        },
        isNew: true
    },
    {
        id: 2,
        name: "Quiosque Pé na Areia",
        logo: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        banner: "https://images.unsplash.com/photo-1535498730771-e735b998cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        description: "Quiosque charmoso à beira-mar, perfeito para relaxar enquanto aproveita petiscos, bebidas geladas e a brisa do mar. Ambiente descontraído e aconchegante.",
        phone: "(22) 99123-4567",
        email: "contato@penaareia.com.br",
        address: "Praia do Forte, Quiosque 45 - Cabo Frio - RJ",
        website: "www.quiosquepenaareia.com.br",
        social: {
            instagram: "penaareia",
            facebook: "quiosquepenaareia"
        },
        isNew: false
    },
    {
        id: 3,
        name: "Bar do Mar",
        logo: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        banner: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        description: "Drinks especiais e música ao vivo todos os dias. Venha curtir o pôr do sol com a melhor vista da cidade e as melhores caipirinhas da região.",
        phone: "(22) 3456-7890",
        email: "reservas@bardomar.com.br",
        address: "Rua das Conchas, 78 - Centro, Cabo Frio - RJ",
        website: "www.bardomar.com.br",
        social: {
            instagram: "bardomar_oficial",
            facebook: "bardomar",
            twitter: "bardomarcf"
        },
        isNew: false
    },
    {
        id: 4,
        name: "Shopping Cabo Mall",
        logo: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        banner: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        description: "O maior centro comercial da região, com mais de 150 lojas, praça de alimentação variada e opções de entretenimento para toda a família.",
        phone: "(22) 2222-3333",
        email: "sac@cabomall.com.br",
        address: "Av. dos Turistas, 1500 - Braga, Cabo Frio - RJ",
        website: "www.shoppingcabomall.com.br",
        social: {
            instagram: "cabomall",
            facebook: "shoppingcabomall",
            twitter: "cabomall"
        },
        isNew: true
    },
    {
        id: 5,
        name: "Translado Executivo",
        logo: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        banner: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        description: "Serviço de transporte executivo para aeroportos, passeios turísticos e transfers. Frota moderna, motoristas bilíngues e conforto premium.",
        phone: "(22) 99444-5555",
        email: "reservas@transladoexecutivo.com.br",
        address: "Rua dos Viajantes, 200 - Centro, Cabo Frio - RJ",
        website: "www.transladoexecutivo.com.br",
        social: {
            instagram: "translado_executivo",
            facebook: "transladoexecutivo"
        },
        isNew: false
    },
    {
        id: 6,
        name: "Spa Oceano",
        logo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
        banner: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80",
        description: "Relaxe e renove suas energias em nosso spa com vista para o oceano. Tratamentos faciais, massagens terapêuticas e pacotes especiais para casais.",
        phone: "(22) 2123-4567",
        email: "agendamento@spaoceano.com.br",
        address: "Av. Atlântica, 789 - Praia do Forte, Cabo Frio - RJ",
        website: "www.spaoceano.com.br",
        social: {
            instagram: "spa_oceano",
            facebook: "spaoceano"
        },
        isNew: false
    }
];

// Function to get partner by ID
function getPartnerById(id) {
    return partnersData.find(partner => partner.id === id);
}

// Function to get all partners
function getAllPartners() {
    return partnersData;
}