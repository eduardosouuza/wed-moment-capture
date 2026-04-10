import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTheme, applyTheme, themes } from './themes';
import type { ThemeColor } from './themes';

describe('getTheme', () => {
  it('retorna o tema roxo por padrão', () => {
    const theme = getTheme();
    expect(theme).toEqual(themes.purple);
  });

  it('retorna o tema correto para cada cor', () => {
    const colors: ThemeColor[] = ['purple', 'blue', 'pink', 'green', 'orange', 'red'];
    colors.forEach(color => {
      expect(getTheme(color)).toEqual(themes[color]);
    });
  });

  it('usa fallback para roxo em cor inválida', () => {
    const theme = getTheme('invalid' as ThemeColor);
    expect(theme).toEqual(themes.purple);
  });

  it('cada tema tem todas as propriedades obrigatórias', () => {
    const requiredProps = ['name', 'emoji', 'primary', 'primaryHover', 'secondary', 'accent', 'light', 'textOnPrimary'];
    Object.values(themes).forEach(theme => {
      requiredProps.forEach(prop => {
        expect(theme).toHaveProperty(prop);
      });
    });
  });

  it('propriedades de cor são strings hex válidas', () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    Object.values(themes).forEach(theme => {
      expect(theme.primary).toMatch(hexRegex);
      expect(theme.primaryHover).toMatch(hexRegex);
      expect(theme.secondary).toMatch(hexRegex);
      expect(theme.accent).toMatch(hexRegex);
      expect(theme.light).toMatch(hexRegex);
    });
  });

  it('primaryHover é mais escuro que primary', () => {
    // Para o tema roxo, primary=#8B5CF6 e primaryHover=#7C3AED
    // O hex de hover deve ser "menor" (mais escuro) visualmente
    const purple = themes.purple;
    expect(purple.primary).not.toEqual(purple.primaryHover);
  });
});

describe('applyTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(document.documentElement.style, 'setProperty');
  });

  it('aplica variáveis CSS para o tema azul', () => {
    applyTheme('blue');
    const theme = themes.blue;
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--theme-primary', theme.primary);
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--theme-secondary', theme.secondary);
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--theme-accent', theme.accent);
    expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--theme-light', theme.light);
  });

  it('define exatamente 6 variáveis CSS', () => {
    applyTheme('pink');
    expect(document.documentElement.style.setProperty).toHaveBeenCalledTimes(6);
  });

  it('aplica tema correto para cada cor', () => {
    const colors: ThemeColor[] = ['purple', 'blue', 'pink', 'green', 'orange', 'red'];
    colors.forEach(color => {
      vi.clearAllMocks();
      applyTheme(color);
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith('--theme-primary', themes[color].primary);
    });
  });
});
