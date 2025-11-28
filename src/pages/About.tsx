import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Eye, Heart, Award, Users, Leaf, FlaskConical } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: FlaskConical,
      title: 'Nano Innovation',
      description: 'Pioneering advanced nanotechnology solutions for superior efficacy.',
    },
    {
      icon: Leaf,
      title: 'Eco-Conscious',
      description: 'Prioritizing natural, organic, and biodegradable ingredients.',
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Rigorous testing to ensure safety across skincare and agriculture.',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Empowering individuals and industries to thrive sustainably.',
    },
  ];

  const achievements = [
    { number: '50K+', label: 'Lives Enriched' },
    { number: '100+', label: 'Nano Formulations' },
    { number: '15+', label: 'Research Partners' },
    { number: '4.9★', label: 'Average Rating' },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-[#5E3A86]/5 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 border-[#5E3A86] text-[#5E3A86]">About Us</Badge>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#5E3A86] mb-6">
              Empowering Life Through Eco-Nano Innovation
            </h1>
            <p className="text-lg text-muted-foreground">
              At Nanoenrich India Pvt Ltd., we harness the transformative power of advanced nanotechnology 
              and eco-friendly science to create next-generation solutions for Biopharmaceutical products, 
              skincare, agriculture, and wound care. Our mission is to enrich lives naturally, blending 
              innovation with sustainability to bring you safe, effective, and environmentally conscious formulations.
            </p>
          </div>
        </div>
      </section>

      {/* Story / Innovation */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#5E3A86] mb-6">
                Innovation & Impact
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Whether you’re looking to nourish your skin, boost plant health, or accelerate healing, 
                  our bio-based nanotechnologies offer smart, sustainable, and science-backed solutions.
                </p>
                <p>
                  At NanoEnrich, we go beyond product development — we create meaningful impact. Our 
                  multidisciplinary team of experts in nanoscience, herbal medicine, and biotechnology 
                  works tirelessly to deliver innovations that solve real-world problems. From boosting 
                  skin vitality to supporting sustainable farming, every formulation is built on rigorous 
                  research, clean ingredients, and a commitment to long-term wellness for people and the planet.
                </p>
                <p>
                  Driven by purpose and powered by collaboration, we continuously explore emerging technologies 
                  and natural actives to evolve our product line. Our partnerships with academic institutions, 
                  industry leaders, and government bodies ensure that our offerings are not only effective 
                  but also future-ready.
                </p>
                <p className="font-medium text-[#5E3A86]">
                  With NanoEnrich, you’re not just choosing a product — you’re choosing a smarter, greener way forward.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((item) => (
                  <Card key={item.label} className="text-center border-[#5E3A86]/20">
                    <CardContent className="p-6">
                      <p className="text-3xl md:text-4xl font-bold text-[#5E3A86] mb-2">
                        {item.number}
                      </p>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-[#7EC242]/10 border-none">
                 <CardContent className="p-6">
                    <h3 className="font-semibold text-[#5E3A86] mb-2 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Strategic Collaboration
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We collaborate with academic institutions to participate in advanced research and 
                      development initiatives. Additionally, we partner with industry leaders that share 
                      our dedication to innovation and high quality. In addition, we collaborate with 
                      government agencies to obtain funding and assistance for innovative initiatives.
                    </p>
                 </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <Card className="bg-[#5E3A86] text-white border-none shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-white/90 mb-4">
                  At Nanoenrich India Pvt Ltd., our mission is to redefine wellness and sustainability 
                  by developing eco-friendly, nanotechnology-based solutions that enhance skin health, 
                  crop productivity, and wound care—naturally and effectively.
                </p>
                <div className="text-sm font-semibold mb-2 text-[#7EC242]">We are dedicated to:</div>
                <ul className="list-disc list-inside space-y-2 text-white/80 text-sm">
                  <li>Blending nature with science to create safe, high-performance formulations.</li>
                  <li>Replacing harmful chemicals with clean, green, and biocompatible ingredients.</li>
                  <li>Driving sustainability across personal care, agriculture, and healthcare industries.</li>
                  <li>Innovating responsibly through continuous research, ethical practices, and quality assurance.</li>
                </ul>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card className="border-[#5E3A86]/10 shadow-lg">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-full bg-[#7EC242]/10 flex items-center justify-center mb-6">
                  <Eye className="h-6 w-6 text-[#7EC242]" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#5E3A86] mb-4">Our Vision</h3>
                <p className="text-muted-foreground mb-4">
                  Nanoenrich India Pvt Ltd. aims to become a global leader in eco-conscious nanotechnology, 
                  pioneering transformative solutions that nourish lives, restore nature, and redefine 
                  health and sustainability one nano innovation at a time.
                </p>
                <p className="text-muted-foreground">
                  We envision a future where science and nature work together—not against each other—delivering 
                  breakthroughs in skincare, agriculture, and healing that are safe for people, powerful 
                  in performance, and kind to the planet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#5E3A86] mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from product development to customer service.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center hover:shadow-md transition-shadow border-[#5E3A86]/10">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-[#7EC242]/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-[#7EC242]" />
                  </div>
                  <h3 className="font-semibold text-[#5E3A86] mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 lg:py-24 bg-[#5E3A86]/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#5E3A86] mb-4">
              Certifications & Quality
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to quality is backed by industry-recognized certifications.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {['GMP Certified', 'ISO 9001:2015', 'FSSAI Approved', 'Cruelty Free', 'Organic Certified'].map((cert) => (
              <Badge key={cert} variant="secondary" className="text-sm px-4 py-2 bg-white text-[#5E3A86] hover:bg-white/90">
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;