export interface Chapter {
  id: string;
  title: string;
  class: Grade;
}

export interface ContentSection {
  type: 'theory' | 'derivation' | 'practice' | 'assignment';
  content: string;
}

export type Grade = '11' | '12' | 'JEE' | 'NEET' | 'BITSAT' | 'CUET';
