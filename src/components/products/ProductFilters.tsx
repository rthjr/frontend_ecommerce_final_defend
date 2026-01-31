'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useState, useEffect, useCallback } from 'react';

const categories = ['Clothing', 'Electronics', 'Footwear', 'Accessories'];
const sizes = ['S', 'M', 'L', 'XL', '2XL'];
const colors = ['Black', 'White', 'Blue', 'Red', 'Green'];

export default function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  useEffect(() => {
    // Sync state with URL params on mount
    const categoryParam = searchParams.get('category');
    const sizeParam = searchParams.get('size');
    const colorParam = searchParams.get('color');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(','));
    } else {
      setSelectedCategories([]);
    }
    
    if (sizeParam) {
      setSelectedSizes(sizeParam.split(','));
    } else {
      setSelectedSizes([]);
    }
    
    if (colorParam) {
      setSelectedColors(colorParam.split(','));
    } else {
      setSelectedColors([]);
    }
    
    if (minPriceParam && maxPriceParam) {
      setPriceRange([Number(minPriceParam), Number(maxPriceParam)]);
    }
  }, [searchParams]);

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/products/search?${params.toString()}`);
  }, [router, searchParams]);

  const handleCategoryChange = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    updateParams({ category: newCategories.join(',') });
  };

  const handleSizeChange = (size: string) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    
    setSelectedSizes(newSizes);
    updateParams({ size: newSizes.join(',') });
  };

  const handleColorChange = (color: string) => {
    const newColors = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    
    setSelectedColors(newColors);
    updateParams({ color: newColors.join(',') });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/products/search')}
          className="text-muted-foreground hover:text-primary"
        >
          Clear All
        </Button>
      </div>

      <Accordion type="single" collapsible defaultValue="category" className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${category}`} 
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 px-1">
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                onValueCommit={(value) => updateParams({ minPrice: value[0].toString(), maxPrice: value[1].toString() })}
              />
              <div className="flex items-center justify-between text-sm">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`size-${size}`} 
                    checked={selectedSizes.includes(size)}
                    onCheckedChange={() => handleSizeChange(size)}
                  />
                  <Label htmlFor={`size-${size}`}>{size}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="color">
          <AccordionTrigger>Color</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <div key={color} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`color-${color}`} 
                    checked={selectedColors.includes(color)}
                    onCheckedChange={() => handleColorChange(color)}
                  />
                  <Label htmlFor={`color-${color}`}>{color}</Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
