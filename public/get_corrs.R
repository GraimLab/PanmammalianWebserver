## Code to calculate spearman correlation of a subset of genes from a PhyloP results

## Load tidyverse to simplify our lives
library('tidyverse')
setwd("C:/Users/gi.padovani/OneDrive - University of Florida/MammalianCancer/corrected_clean_runs_tss_EH_cosmic/")
## Load the human data
dat <- read.table('Homo_sapiens_corrected_clean_tss_genes_EH_cosmic.txt', sep='\t', header=T) # TODO: Replace with human file. This is just a test script

## Load the list of species
# kiley code: species <- read.table('C:/Users/gi.padovani/OneDrive - University of Florida/MammalianCancer/Species_list.txt')[,1] # One species per line. See example file
species_data <- read.table('C:/Users/gi.padovani/OneDrive - University of Florida/MammalianCancer/sp_family_order.txt', header=FALSE, stringsAsFactors=FALSE)
species <- species_data[,1]
## Create empty correlation data object
corrs_species <- data.frame(cancer_type=NA, species=NA, correlation=NA)

## Calculate pairwise correlation of human vs all
for(i in unique(species)) {
  ## Load species data, calculate overall (all cancers) correlation to human
  dat2 <- read.table(paste0(i,'_corrected_clean_tss_genes_EH_cosmic.txt'), sep='\t', header=T) # load the species data file
  corrs_species <- corrs_species %>% add_row(species = i, cancer_type = 'all', correlation = cor(dat[,'lnlratio'], dat2[,'lnlratio'], method='spearman')) # All cancers

  ## Now grab specific cancers
  for(j in unique(dat$cancer_type)) {
    genes <- which(dat$cancer_type==j) # Get indices of sites within the cancer type genes
    if(length(genes) > 0) { corrs_species <- corrs_species %>% add_row(species = i, cancer_type = j, correlation = cor(dat[genes,'lnlratio'], dat2[genes,'lnlratio'], method='spearman')) }
  }
}

## Remove the first NA row, and any others
corrs_species <- corrs_species %>% drop_na()

## Save ALL results to file
write.table(corrs_species, file='Species_correlations_g.txt')

## Now reduce to the top n species per cancer type

## Create empty correlation data object
top_species <- data.frame(cancer_type=NA, species=NA, correlation=NA)
n <- 5 # The number of species you want to grab

for(j in unique(dat$cancer_type)) {
  sorted_data <- corrs_species[corrs_species$cancer_type==j,]
  sorted_data <- sorted_data[with(sorted_data, order(-correlation)),]
  for(k in 1:n) { top_species <- top_species %>% add_row(sorted_data[k,]) }
}

## Remove the first NA row, and any others
top_species <- top_species %>% drop_na()

## Save top results to file
write.table(top_species, file='Top_species_correlations_g.txt')




