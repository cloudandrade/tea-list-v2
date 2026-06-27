'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import BR from 'country-flag-icons/react/3x2/BR';
import US from 'country-flag-icons/react/3x2/US';

const LANGUAGE_KEY = 'tea-list-v2:language';

const dictionaries = {
  'pt-BR': {
    common: {
      loading: 'Carregando...',
      loadingTeaList: 'Carregando Tea List',
      justMoment: 'Só um instante...',
      cancel: 'Cancelar',
      save: 'Salvar',
      confirm: 'Confirmar',
      delete: 'Excluir',
      edit: 'Editar',
      back: 'Voltar',
      profile: 'Perfil',
      dashboard: 'Dashboard',
      create: 'Criar',
      logout: 'Sair',
    },
    auth: {
      tagline: 'Organize sua celebração perfeita, um presente especial por vez.',
      welcomeBack: 'Bem-vindo(a) de volta',
      accessRegistry: 'Acesse sua lista',
      email: 'E-mail',
      password: 'Senha',
      forgot: 'Esqueceu?',
      remember: 'Salvar login e senha neste dispositivo',
      signingIn: 'Entrando...',
      signIn: 'Entrar na conta',
      newCommunity: 'Novo por aqui?',
      registerLink: 'Criar uma conta',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Serviço',
      help: 'Central de Ajuda',
      createAccount: 'Criar Conta',
      joinToday: 'Entre no Tea List hoje.',
      name: 'Nome',
      namePlaceholder: 'Digite seu nome completo',
      passwordPlaceholder: 'Mín. 8 caracteres',
      confirmPassword: 'Confirmar senha',
      confirmPasswordPlaceholder: 'Repita sua senha',
      creating: 'Criando...',
      alreadyAccount: 'Já tem uma conta?',
      signInLink: 'Entrar',
      passwordMismatch: 'As senhas precisam ser iguais.',
    },
    dashboard: {
      hello: 'Olá, {name}',
      welcomeWithLists: 'Bem-vindo(a) de volta. Suas listas de presentes e celebrações estão organizadas abaixo.',
      welcomeEmpty: 'Bem-vinda de volta. Suas listas reais aparecerão aqui assim que forem criadas.',
      acquiredItems: '{reserved} de {total} itens adquiridos',
      manageList: 'Gerenciar Lista',
      emptyTitle: 'Inicie um novo marco',
      emptyText: 'Você ainda não tem listas cadastradas. Crie a primeira para começar.',
      createNewList: 'Criar nova lista',
      loadingLists: 'Carregando suas listas...',
    },
    lists: {
      myList: 'Minha Lista',
      teaList: 'Tea List',
      createNewItem: 'Criar novo item',
      publicLink: 'Link público',
      openPublicView: 'Abrir visualização pública',
      deleteItemTitle: 'Excluir item?',
      deleteItemText: 'Tem certeza que deseja excluir "{name}"? Essa ação não pode ser desfeita.',
      deleteItem: 'Excluir item',
      deleting: 'Excluindo...',
      deleteListTitle: 'Excluir lista?',
      deleteListText: 'Tem certeza que deseja excluir "{title}"? Todos os itens e reservas dessa lista também serão removidos.',
      deleteList: 'Excluir lista',
      itemDeleted: 'Item excluído.',
      itemUpdated: 'Item atualizado.',
      listDeleted: 'Lista excluída.',
      itemsAdded: '{count} item(ns) adicionado(s) à lista.',
      loadingList: 'Carregando lista...',
      loadingPublicList: 'Carregando lista pública...',
      publicLoadErrorTitle: 'Não foi possível carregar esta lista',
      guestMessage: 'Mensagem aos convidados',
      emptyItemsTitle: 'Nenhum item cadastrado ainda',
      emptyItemsText: 'Adicione itens para compartilhar sua lista com convidados.',
      available: '{available} de {total} disponível',
      reserved: 'Reservado',
      giftedBy: 'Presenteado por {name}',
      reserve: 'Reservar',
      reserving: 'Reservando...',
      reserveItem: 'Reservar item',
      yourName: 'Seu nome',
      phone: 'Telefone',
      itemReserved: 'Item reservado com sucesso.',
      addItem: 'Adicionar item',
      editItem: 'Editar item',
      addItemText: 'Cadastre um novo item para sua lista.',
      editItemText: 'Atualize os dados e a imagem do item.',
      itemName: 'Nome do Item',
      itemNamePlaceholder: 'Ex: Conjunto de Chá de Porcelana',
      approximatePrice: 'Preço aproximado',
      quantity: 'Quantidade',
      descriptionOptional: 'Descrição (Opcional)',
      itemDescriptionPlaceholder: 'Conte aos seus convidados por que você escolheu este item...',
      imageUrlOptional: 'URL da imagem (Opcional)',
      itemImage: 'Imagem do Item',
      uploadPhoto: 'Upload de Foto',
      changeImage: 'Clique para alterar a imagem.',
      imageHint: 'Informe uma URL ou clique para buscar.',
      imageQuote: '"Uma boa imagem ajuda seus convidados a escolherem o presente perfeito."',
      saveChanges: 'Salvar alterações',
      saveItem: 'Salvar item',
      saving: 'Salvando...',
      invalidImage: 'Selecione um arquivo de imagem válido.',
      addItemsOpening: 'Abrindo cadastro de item...',
      createDetails: 'Detalhes da Lista',
      editList: 'Editar Lista',
      listDetailsText: 'Personalize sua celebração com detalhes que contam sua história.',
      listTitle: 'Título da Lista',
      listTitlePlaceholder: 'Ex: O Casamento de Ana & João',
      subtitleOptional: 'Subtítulo (Opcional)',
      subtitlePlaceholder: 'Ex: Uma nova jornada começa aqui',
      celebrationType: 'Tipo de Celebração',
      displayMode: 'Modo de Exibição',
      guestMessageOptional: 'Mensagem aos Convidados (Opcional)',
      guestMessagePlaceholder: 'Sua mensagem calorosa aqui...',
      coverChoose: 'Escolha uma imagem de capa',
      coverChange: 'Alterar imagem de capa',
      visualIdentity: 'Identidade Visual',
      colorPalette: 'Paleta de Cores',
      backgroundTexture: 'Textura de Fundo',
      themePreview: 'Prévia do tema',
      previewTitle: 'Título da sua lista',
      compactView: 'Visual compacto',
      detailedView: 'Visual com detalhes',
      saveList: 'Salvar e Gerar Lista',
      listUpdated: 'Lista atualizada.',
      listCreated: 'Lista criada.',
      displayBlocks: 'Blocos',
      displayDetailed: 'Lista detalhada',
      displayCompact: 'Lista compacta',
      celebrationWedding: 'Casamento',
      celebrationNewHome: 'Casa Nova',
      celebrationBaby: 'Chá de Bebê',
      celebrationBirthday: 'Aniversário',
      celebrationMissionary: 'Missionário',
      celebrationOther: 'Outro',
      patternPlain: 'Liso',
      patternDots: 'Pontilhado',
      patternStripes: 'Listrado',
      patternGingham: 'Xadrez',
      patternWaves: 'Ondas',
      patternGradient: 'Degradê',
      patternFloral: 'Floral',
      anonymousGuest: 'convidado',
      previewItemDinner: 'Jogo de jantar artesanal',
      previewItemDinnerDescription: 'Peças delicadas para receber com carinho.',
      previewItemBreakfast: 'Kit café da manhã',
      previewItemBreakfastDescription: 'Uma seleção charmosa para a nova rotina.',
      previewItemBlanket: 'Manta decorativa',
      previewItemBlanketDescription: 'Textura macia em tons neutros.',
      previewItemVase: 'Vaso em cerâmica',
      previewItemVaseDescription: 'Um detalhe afetivo para compor a casa.',
    },
  },
  'en-US': {
    common: {
      loading: 'Loading...',
      loadingTeaList: 'Loading Tea List',
      justMoment: 'Just a moment...',
      cancel: 'Cancel',
      save: 'Save',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      profile: 'Profile',
      dashboard: 'Dashboard',
      create: 'Create',
      logout: 'Log out',
    },
    auth: {
      tagline: 'Curate your perfect celebration, one thoughtful gift at a time.',
      welcomeBack: 'Welcome back',
      accessRegistry: 'Access your registry',
      email: 'Email Address',
      password: 'Password',
      forgot: 'Forgot?',
      remember: 'Save email and password on this device',
      signingIn: 'Signing in...',
      signIn: 'Sign in to Account',
      newCommunity: 'New to the community?',
      registerLink: 'Register for an account',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      help: 'Help Center',
      createAccount: 'Create Account',
      joinToday: 'Join Tea List today.',
      name: 'Name',
      namePlaceholder: 'Enter your full name',
      passwordPlaceholder: 'Min. 8 characters',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: 'Repeat your password',
      creating: 'Creating...',
      alreadyAccount: 'Already have an account?',
      signInLink: 'Sign In',
      passwordMismatch: 'Passwords must match.',
    },
    dashboard: {
      hello: 'Hello, {name}',
      welcomeWithLists: 'Welcome back. Your gift and celebration lists are organized below.',
      welcomeEmpty: 'Welcome back. Your real lists will appear here as soon as they are created.',
      acquiredItems: '{reserved} of {total} items acquired',
      manageList: 'Manage List',
      emptyTitle: 'Start a new milestone',
      emptyText: 'You do not have any lists yet. Create your first one to begin.',
      createNewList: 'Create new list',
      loadingLists: 'Loading your lists...',
    },
    lists: {
      myList: 'My List',
      teaList: 'Tea List',
      createNewItem: 'Create new item',
      publicLink: 'Public link',
      openPublicView: 'Open public view',
      deleteItemTitle: 'Delete item?',
      deleteItemText: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
      deleteItem: 'Delete item',
      deleting: 'Deleting...',
      deleteListTitle: 'Delete list?',
      deleteListText: 'Are you sure you want to delete "{title}"? All items and reservations for this list will also be removed.',
      deleteList: 'Delete list',
      itemDeleted: 'Item deleted.',
      itemUpdated: 'Item updated.',
      listDeleted: 'List deleted.',
      itemsAdded: '{count} item(s) added to the list.',
      loadingList: 'Loading list...',
      loadingPublicList: 'Loading public list...',
      publicLoadErrorTitle: 'Could not load this list',
      guestMessage: 'Message to guests',
      emptyItemsTitle: 'No items yet',
      emptyItemsText: 'Add items to share your list with guests.',
      available: '{available} of {total} available',
      reserved: 'Reserved',
      giftedBy: 'Gifted by {name}',
      reserve: 'Reserve',
      reserving: 'Reserving...',
      reserveItem: 'Reserve item',
      yourName: 'Your name',
      phone: 'Phone',
      itemReserved: 'Item reserved successfully.',
      addItem: 'Add item',
      editItem: 'Edit item',
      addItemText: 'Add a new item to your list.',
      editItemText: 'Update item details and image.',
      itemName: 'Item name',
      itemNamePlaceholder: 'Ex: Porcelain tea set',
      approximatePrice: 'Approximate price',
      quantity: 'Quantity',
      descriptionOptional: 'Description (Optional)',
      itemDescriptionPlaceholder: 'Tell your guests why you chose this item...',
      imageUrlOptional: 'Image URL (Optional)',
      itemImage: 'Item image',
      uploadPhoto: 'Photo upload',
      changeImage: 'Click to change the image.',
      imageHint: 'Enter a URL or click to browse.',
      imageQuote: '"A good image helps your guests choose the perfect gift."',
      saveChanges: 'Save changes',
      saveItem: 'Save item',
      saving: 'Saving...',
      invalidImage: 'Please select a valid image file.',
      addItemsOpening: 'Opening item form...',
      createDetails: 'List Details',
      editList: 'Edit List',
      listDetailsText: 'Customize your celebration with details that tell your story.',
      listTitle: 'List title',
      listTitlePlaceholder: 'Ex: Ana & John Wedding',
      subtitleOptional: 'Subtitle (Optional)',
      subtitlePlaceholder: 'Ex: A new journey starts here',
      celebrationType: 'Celebration type',
      displayMode: 'Display mode',
      guestMessageOptional: 'Message to Guests (Optional)',
      guestMessagePlaceholder: 'Your warm message here...',
      coverChoose: 'Choose a cover image',
      coverChange: 'Change cover image',
      visualIdentity: 'Visual Identity',
      colorPalette: 'Color Palette',
      backgroundTexture: 'Background Texture',
      themePreview: 'Theme preview',
      previewTitle: 'Your list title',
      compactView: 'Compact view',
      detailedView: 'Detailed view',
      saveList: 'Save and Generate List',
      listUpdated: 'List updated.',
      listCreated: 'List created.',
      displayBlocks: 'Blocks',
      displayDetailed: 'Detailed list',
      displayCompact: 'Compact list',
      celebrationWedding: 'Wedding',
      celebrationNewHome: 'New Home',
      celebrationBaby: 'Baby Shower',
      celebrationBirthday: 'Birthday',
      celebrationMissionary: 'Missionary',
      celebrationOther: 'Other',
      patternPlain: 'Plain',
      patternDots: 'Dotted',
      patternStripes: 'Striped',
      patternGingham: 'Gingham',
      patternWaves: 'Waves',
      patternGradient: 'Gradient',
      patternFloral: 'Floral',
      anonymousGuest: 'guest',
      previewItemDinner: 'Handmade dinnerware set',
      previewItemDinnerDescription: 'Delicate pieces for hosting with care.',
      previewItemBreakfast: 'Breakfast kit',
      previewItemBreakfastDescription: 'A charming selection for a new routine.',
      previewItemBlanket: 'Decorative throw blanket',
      previewItemBlanketDescription: 'Soft texture in neutral tones.',
      previewItemVase: 'Ceramic vase',
      previewItemVaseDescription: 'A warm detail for the home.',
    },
  },
};

const I18nContext = createContext(null);

function getNestedValue(dictionary, key) {
  return key.split('.').reduce((current, part) => current?.[part], dictionary);
}

function interpolate(value, params) {
  if (!params) {
    return value;
  }

  return Object.entries(params).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    if (typeof window === 'undefined') {
      return 'pt-BR';
    }

    const savedLocale = window.localStorage.getItem(LANGUAGE_KEY);
    return savedLocale && dictionaries[savedLocale] ? savedLocale : 'pt-BR';
  });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const changeLocale = useCallback((nextLocale) => {
    setLocale(nextLocale);
    window.localStorage.setItem(LANGUAGE_KEY, nextLocale);
  }, []);

  const t = useCallback((key, params) => {
    const value = getNestedValue(dictionaries[locale], key) || getNestedValue(dictionaries['pt-BR'], key) || key;
    return interpolate(value, params);
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale: changeLocale, t }), [changeLocale, locale, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const CurrentFlag = locale === 'pt-BR' ? BR : US;

  return (
    <label className="language-switcher">
      <CurrentFlag className="language-switcher-flag" aria-hidden="true" />
      <select aria-label="Selecionar idioma" value={locale} onChange={(event) => setLocale(event.target.value)}>
        <option value="pt-BR">Português Brasil</option>
        <option value="en-US">English US</option>
      </select>
    </label>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n deve ser usado dentro de I18nProvider.');
  }

  return context;
}
