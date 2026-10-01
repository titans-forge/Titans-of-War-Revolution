export const CAMPAIGN_SCENES = {
  boston: {
    image: '/images/campaign/boston-cambridge-1775.webp',
    label: 'BOSTON & CAMBRIDGE · 1775',
    position: 'center 48%',
  },
  congress: {
    image: '/images/campaign/philadelphia-congress-1776.webp',
    label: 'PHILADELPHIA · CONTINENTAL CONGRESS',
    position: 'center 48%',
  },
  independenceVote: {
    image: '/images/campaign/independence-vote-1776.webp',
    label: 'PENNSYLVANIA STATE HOUSE · JULY 2, 1776',
    position: 'center 48%',
  },
  declarationPress: {
    image: '/images/campaign/dunlap-print-shop-1776.webp',
    label: 'DUNLAP’S PRINT SHOP · JULY 4, 1776',
    position: 'center 50%',
  },
  newYork: {
    image: '/images/campaign/new-york-harbor-1776.webp',
    label: 'NEW YORK HARBOR · SUMMER 1776',
    position: 'center 47%',
  },
  delaware: {
    image: '/images/campaign/delaware-winter-1776.webp',
    label: 'THE DELAWARE · WINTER 1776',
    position: 'center 49%',
  },
  brandywine: {
    image: '/images/campaign/brandywine-1777.webp',
    label: 'BRANDYWINE VALLEY · SEPTEMBER 1777',
    position: 'center 51%',
  },
  saratoga: {
    image: '/images/campaign/saratoga-1777.webp',
    label: 'UPPER HUDSON · AUTUMN 1777',
    position: 'center 50%',
  },
  paris: {
    image: '/images/campaign/paris-alliance-1778.webp',
    label: 'VERSAILLES · FEBRUARY 1778',
    position: 'center 48%',
  },
  valleyForge: {
    image: '/images/campaign/valley-forge-1778.webp',
    label: 'VALLEY FORGE · WINTER 1777–1778',
    position: 'center 52%',
  },
  monmouth: {
    image: '/images/campaign/monmouth-1778.webp',
    label: 'NEW JERSEY · JUNE 1778',
    position: 'center 50%',
  },
  newport: {
    image: '/images/campaign/newport-alliance-1778.webp',
    label: 'NARRAGANSETT BAY · AUGUST 1778',
    position: 'center 52%',
  },
  frontier: {
    image: '/images/campaign/frontier-1779.webp',
    label: 'THE NORTHERN FRONTIER · 1779',
    position: 'center 50%',
  },
  carolinas: {
    image: '/images/campaign/carolinas-1781.webp',
    label: 'THE CAROLINAS · 1780–1781',
    position: 'center 48%',
  },
  yorktown: {
    image: '/images/campaign/yorktown-1781.webp',
    label: 'THE CHESAPEAKE · 1781',
    position: 'center 52%',
  },
};

export const SCENE_BY_SCENARIO = {
  concord_aftermath: 'boston',
  continental_command: 'congress',
  bunker_hill_council: 'boston',
  olive_branch: 'congress',
  independence_question: 'congress',
  independence_vote: 'independenceVote',
  declaration_publication: 'declarationPress',
  new_york_defense: 'newYork',
  long_island_council: 'newYork',
  brooklyn_evacuation: 'newYork',
  new_jersey_retreat: 'delaware',
  congressional_emergency: 'congress',
  delaware_gamble: 'delaware',
  winter_reckoning: 'delaware',
  philadelphia_campaign: 'brandywine',
  northern_department: 'saratoga',
  saratoga_council: 'saratoga',
  french_alliance: 'paris',
  valley_forge_crisis: 'valleyForge',
  army_reform: 'valleyForge',
  philadelphia_evacuation: 'monmouth',
  monmouth_council: 'monmouth',
  coalition_reckoning: 'newport',
  frontier_strategy: 'frontier',
  charleston_decision: 'carolinas',
  southern_command: 'carolinas',
  cowpens_council: 'carolinas',
  carolinas_reckoning: 'carolinas',
  chesapeake_convergence: 'yorktown',
  yorktown_siege: 'yorktown',
};

export function getCampaignScene(scenarioId) {
  return CAMPAIGN_SCENES[SCENE_BY_SCENARIO[scenarioId]] || CAMPAIGN_SCENES.boston;
}
