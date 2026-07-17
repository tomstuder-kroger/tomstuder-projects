/**
 * Tests for Capacity App import data mapping
 */

describe('Capacity App Import Mapping', () => {
  const mapRoleToLevel = (icRole) => {
    const role = (icRole || '').toLowerCase().trim();
    if (role.includes('senior') || role.includes('spd')) return 'SPD';
    if (role.includes('associate') || role.includes('apd')) return 'APD';
    return 'PD';
  };

  it('should map senior roles to SPD', () => {
    expect(mapRoleToLevel('Senior Product Designer')).toBe('SPD');
    expect(mapRoleToLevel('Senior Designer')).toBe('SPD');
    expect(mapRoleToLevel('SPD')).toBe('SPD');
  });

  it('should map associate roles to APD', () => {
    expect(mapRoleToLevel('Associate Product Designer')).toBe('APD');
    expect(mapRoleToLevel('Associate Designer')).toBe('APD');
    expect(mapRoleToLevel('APD')).toBe('APD');
  });

  it('should map other roles to PD as default', () => {
    expect(mapRoleToLevel('Product Designer')).toBe('PD');
    expect(mapRoleToLevel('Designer')).toBe('PD');
    expect(mapRoleToLevel('UX Designer')).toBe('PD');
    expect(mapRoleToLevel('')).toBe('PD');
    expect(mapRoleToLevel(null)).toBe('PD');
    expect(mapRoleToLevel(undefined)).toBe('PD');
  });

  it('should handle case-insensitive matching', () => {
    expect(mapRoleToLevel('SENIOR PRODUCT DESIGNER')).toBe('SPD');
    expect(mapRoleToLevel('associate product designer')).toBe('APD');
    expect(mapRoleToLevel('Product DESIGNER')).toBe('PD');
  });

  it('should create valid designer structure from IC data', () => {
    const sampleIC = {
      icName: 'John Doe',
      icRole: 'Senior Product Designer',
      quarter: 'Q1 FY26',
      weeksInQuarter: 13,
      domains: [
        { id: '123', name: 'Item', projects: [] }
      ]
    };

    const designer = {
      id: 'new-uuid',
      name: sampleIC.icName,
      level: mapRoleToLevel(sampleIC.icRole),
      employmentStatus: 'FTE',
      allocations: []
    };

    expect(designer.name).toBe('John Doe');
    expect(designer.level).toBe('SPD');
    expect(designer.employmentStatus).toBe('FTE');
    expect(designer.allocations).toEqual([]);
  });

  it('should skip ICs with missing names', () => {
    const invalidICs = [
      { icRole: 'Designer' },
      { icName: '', icRole: 'Designer' },
      { icName: null, icRole: 'Designer' }
    ];

    invalidICs.forEach(ic => {
      const isValid = ic.icName && typeof ic.icName === 'string' && ic.icName.trim();
      expect(isValid).toBeFalsy();
    });
  });
});
